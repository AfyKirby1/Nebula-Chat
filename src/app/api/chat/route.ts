import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { getSystemInstruction } from "@/lib/system-instructions";
import { redis } from "@/lib/redis";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history, model, thinking, chatMode, memories, images } = body;
    
    // Generate a stream ID if not provided (though client usually should/could, we'll do it here and return it)
    const streamId = body.streamId || crypto.randomUUID();

    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Google API Key not configured" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Convert history to Gemini format
    const historyContents = (history || []).map((msg: any) => {
      const parts: any[] = [{ text: msg.content }];
      if (msg.attachments && Array.isArray(msg.attachments)) {
        msg.attachments.forEach((att: any) => {
             parts.push({
                inlineData: {
                    mimeType: att.mimeType,
                    data: att.data
                }
            });
        });
      }
      return {
        role: msg.role === "user" ? "user" : "model",
        parts: parts,
      };
    });

    const currentParts: any[] = [{ text: message }];
    if (images && Array.isArray(images)) {
        images.forEach((img: any) => {
            currentParts.push({
                inlineData: {
                    mimeType: img.mimeType,
                    data: img.data
                }
            });
        });
    }

    const contents = [
      ...historyContents,
      { role: "user", parts: currentParts }
    ];

    // Determine model to use.
    let modelId = model || "gemini-2.5-flash";
    
    let systemInstructionText = getSystemInstruction(modelId);
    
    const MODE_INSTRUCTIONS: Record<string, string> = {
      developer: "You are an expert Senior Software Engineer. Your responses should be technical, precise, and focused on best practices. Prioritize code quality, performance, and maintainability. Avoid conversational filler. When writing code, always use modern syntax and robust error handling.",
      creative: "You are a visionary Creative Director. Your goal is to brainstorm, ideate, and inspire. Use vivid language, metaphors, and out-of-the-box thinking. Encourage exploration and offer multiple diverse perspectives.",
      analyst: "You are a Senior Data Analyst and Business Strategist. Your responses should be structured, data-driven, and objective. Use bullet points, pros/cons lists, and frameworks to analyze problems. Focus on clarity, ROI, and actionable insights."
    };

    if (chatMode && MODE_INSTRUCTIONS[chatMode]) {
        systemInstructionText += `\n\n${MODE_INSTRUCTIONS[chatMode]}`;
    }

    if (memories && Array.isArray(memories) && memories.length > 0) {
      systemInstructionText += `\n\n### CORE MEMORIES\nYou have access to the following long-term memories about the user. Use them to personalize your responses:\n${memories.map((m: string) => `- ${m}`).join('\n')}`;
    }

    systemInstructionText += `\n\n### MEMORY MANAGEMENT\nIf the user explicitly asks you to remember something, or if you encounter a highly significant fact that should be stored for future conversations (e.g., user preferences, specific project details, personal info), output it in a special block like this:\n[[MEMORY: content to remember]]\n\nExample:\nUser: "My API key is 123"\nAI: "I'll remember that." [[MEMORY: User's API key is 123]]`;

    systemInstructionText += `\n\nIf you need to explain a process, workflow, or system architecture, you MUST use a Mermaid diagram. Output it as a standard markdown code block with the language set to 'mermaid'.\n\nIMPORTANT MERMAID SYNTAX RULES:\n1. ALWAYS use double quotes for node labels to avoid syntax errors with special characters.\n   CORRECT: A["Start: The beginning"]\n   INCORRECT: A[Start: The beginning]\n2. Escape double quotes inside labels if needed.\n3. Do not use parentheses () inside labels unless they are within quotes.\n   CORRECT: A["Process (Optional)"]\n   INCORRECT: A[Process (Optional)]\n\nExample:\n\`\`\`mermaid\ngraph TD;\n    A["Start Process"]-->B["Complex Step: (Details)"];\n\`\`\`\n\nAfter your response, please provide 3 related follow-up questions that the user might want to ask next. Format them as a JSON block at the very end of your response like this:\n\`\`\`json\n{"related_questions": ["Question 1", "Question 2", "Question 3"]}\n\`\`\``;

    let generationConfig: any = {
        systemInstruction: systemInstructionText
    };

    if (thinking) {
      if (modelId === "gemini-3-pro-preview") {
        generationConfig = {
            ...generationConfig,
            thinkingConfig: {
                includeThoughts: true,
                thinkingLevel: "high"
            }
        };
      } else if (modelId.startsWith("gemini-2.5")) {
        generationConfig = {
            ...generationConfig,
            thinkingConfig: {
                includeThoughts: true,
                thinkingBudget: 16000
            }
        };
      } else if (modelId === "gemini-2.0-flash" || modelId === "gemini-2.0-flash-lite") {
        console.log(`[Chat API] Switching from ${modelId} to gemini-2.0-flash-thinking-exp-01-21 for thinking mode`);
        modelId = "gemini-2.0-flash-thinking-exp-01-21";
      }
    }

    console.log(`[Chat API] Request for model: ${modelId}, thinking: ${thinking}, streamId: ${streamId}`);

    // Start background generation
    // Note: In serverless environments like Vercel, this might need 'waitUntil' or a queue.
    // For local dev/VPS, this async execution works.
    generateAndPublish(streamId, ai, modelId, contents, generationConfig).catch(async (err) => {
        console.error(`[Background] Generation failed for ${streamId}:`, err);
        const errorData = JSON.stringify({ type: "error", text: "Generation failed internally." });
        try {
            await redis.publish(`chat:${streamId}:pubsub`, errorData);
            await redis.xadd(`chat:${streamId}:stream`, '*', 'data', errorData);
        } catch (redisErr) {
            console.error("Failed to report error to Redis:", redisErr);
        }
    });

    return NextResponse.json({ streamId, status: "started" });

  } catch (error: any) {
    console.error("Error in Chat API:", error);
    
    const status = error.status || error.code || 500;
    const message = error.message || "Failed to process request";

    return NextResponse.json(
      { error: message },
      { status: typeof status === 'number' ? status : 500 }
    );
  }
}

async function generateAndPublish(streamId: string, ai: GoogleGenAI, modelId: string, contents: any[], config: any) {
    try {
        const responseStream = await ai.models.generateContentStream({
          model: modelId,
          contents: contents,
          config: config
        });
    
        const iterable = (responseStream as any).stream || responseStream;
              
        for await (const chunk of iterable) {
            if (chunk.candidates && chunk.candidates[0].content && chunk.candidates[0].content.parts) {
                for (const part of chunk.candidates[0].content.parts) {
                    let data = "";
                    if (part.thought) {
                        data = JSON.stringify({ type: "thought", text: part.text });
                    } else if (part.text) {
                        data = JSON.stringify({ type: "text", text: part.text });
                    }
                    
                    if (data) {
                        // XADD: Store in history
                        await redis.xadd(`chat:${streamId}:stream`, '*', 'data', data);
                        // PUBLISH: Send to active listeners
                        await redis.publish(`chat:${streamId}:pubsub`, data);
                    }
                }
            }
        }
        
        const doneData = JSON.stringify({ type: "done" });
        await redis.xadd(`chat:${streamId}:stream`, '*', 'data', doneData);
        await redis.publish(`chat:${streamId}:pubsub`, doneData);
        
        // Set expiry for the stream key to clean up later (e.g., 1 hour)
        await redis.expire(`chat:${streamId}:stream`, 3600);

    } catch (err: any) {
        console.error(`[GenerateAndPublish] Error:`, err);
        const errorData = JSON.stringify({ type: "error", text: err.message || "Unknown error during generation" });
        await redis.xadd(`chat:${streamId}:stream`, '*', 'data', errorData);
        await redis.publish(`chat:${streamId}:pubsub`, errorData);
    }
}
