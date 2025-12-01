import { Message, Attachment } from "@/types/chat";

// Helper to clean response and extract questions
function processResponseText(fullResponse: string) {
  let relatedQuestions: string[] = [];
  let displayResponse = fullResponse;

  const jsonBlockMatch = fullResponse.match(/```json\s*({"related_questions":\s*\[.*?\]})\s*```/s);
  if (jsonBlockMatch) {
      try {
          const json = JSON.parse(jsonBlockMatch[1]);
          if (json.related_questions && Array.isArray(json.related_questions)) {
              relatedQuestions = json.related_questions;
              displayResponse = fullResponse.replace(/```json\s*{"related_questions":\s*\[.*?\]}\s*```/s, '').trim();
          }
      } catch (e) {
          // incomplete json, ignore
      }
  }
  
  return { response: displayResponse, relatedQuestions };
}

export async function sendMessageToGemini(
  history: Message[],
  newMessage: string,
  model?: string,
  thinking: boolean = false,
  chatMode: string = "standard",
  memories: string[] = [],
  images: Attachment[] = [],
  onUpdate?: (data: { response: string, thoughts?: string, relatedQuestions?: string[] }) => void,
  signal?: AbortSignal,
  streamConfig?: { streamId?: string; resume?: boolean }
): Promise<{ response: string, thoughts?: string, relatedQuestions?: string[] }> {
  const streamId = streamConfig?.streamId || crypto.randomUUID();
  const isResuming = streamConfig?.resume || false;

  try {
    // 1. Start Generation (Publisher) - Only if NOT resuming
    if (!isResuming) {
        const startRes = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
              streamId, 
              history, 
              message: newMessage, 
              images,
              model, 
              thinking, 
              chatMode, 
              memories 
          }),
          signal,
        });

        if (!startRes.ok) {
          const errorData = await startRes.json();
          const errorMessage = errorData.error || 'Failed to start AI generation';
          const error: any = new Error(errorMessage);
          error.status = startRes.status;
          throw error;
        }
    }

    // 2. Connect to Stream (Subscriber)
    // Use EventSource for SSE
    const eventSource = new EventSource(`/api/chat/stream?streamId=${streamId}`);
    
    let fullResponse = "";
    let fullThoughts = "";
    let relatedQuestions: string[] = [];

    return new Promise((resolve, reject) => {
        // Handle cleanup on abort
        if (signal) {
            signal.addEventListener('abort', () => {
                eventSource.close();
                reject(new DOMException('Aborted', 'AbortError'));
            });
        }

        eventSource.onmessage = (event) => {
            try {
                // event.data is the JSON string sent from server
                const data = JSON.parse(event.data);

                if (data.type === "thought") {
                    fullThoughts += data.text;
                } else if (data.type === "text") {
                    fullResponse += data.text;
                } else if (data.type === "done") {
                    eventSource.close();
                    const { response, relatedQuestions: finalQuestions } = processResponseText(fullResponse);
                    resolve({ 
                        response, 
                        thoughts: fullThoughts, 
                        relatedQuestions: finalQuestions.length > 0 ? finalQuestions : relatedQuestions 
                    });
                    return;
                } else if (data.type === "error") {
                    eventSource.close();
                    reject(new Error(data.text));
                    return;
                }

                // Live Update
                if (onUpdate) {
                    const { response, relatedQuestions: currentQuestions } = processResponseText(fullResponse);
                    if (currentQuestions.length > 0) relatedQuestions = currentQuestions;
                    
                    onUpdate({ 
                        response, 
                        thoughts: fullThoughts, 
                        relatedQuestions 
                    });
                }

            } catch (e) {
                console.error("Error parsing SSE data:", e);
            }
        };

        eventSource.onerror = (err) => {
            if (eventSource.readyState === EventSource.CLOSED) {
                // Done
            } else {
                console.error("SSE Connection Error", err);
                eventSource.close();
                reject(new Error("Stream connection failed"));
            }
        };
    });

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}
