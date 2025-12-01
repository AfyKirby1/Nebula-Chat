import { useState, useCallback, useEffect, useRef } from "react";
import { sendMessageToGemini } from "@/services/google-api";
import { Message, Model, Attachment } from "@/types/chat";

export interface Memory {
  id: string;
  content: string;
  createdAt: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export function useChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("gemini-2.5-pro");
  const [isThinking, setIsThinking] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [isModelsLoading, setIsModelsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [userName, setUserName] = useState("Human");
  const [chatMode, setChatMode] = useState<string>("standard");
  const [memories, setMemories] = useState<Memory[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem("chat_sessions");
    const savedMessages = localStorage.getItem("chat_messages");
    const savedMemories = localStorage.getItem("chat_memories");
    
    if (savedMemories) {
        try {
            setMemories(JSON.parse(savedMemories));
        } catch (e) {
            console.error("Failed to parse memories", e);
        }
    }
    
    if (savedSessions) {
      try {
        const parsedSessions = JSON.parse(savedSessions);
        setSessions(parsedSessions);
        if (parsedSessions.length > 0) {
          // Load the most recent session or a specific one if we stored last_session_id
          const lastSessionId = localStorage.getItem("last_session_id");
          if (lastSessionId && parsedSessions.find((s: ChatSession) => s.id === lastSessionId)) {
            setCurrentSessionId(lastSessionId);
          } else {
            setCurrentSessionId(parsedSessions[0].id);
          }
        } else {
           // Create initial session if empty
           createNewChat();
        }
      } catch (e) {
        console.error("Failed to parse chat sessions", e);
        createNewChat();
      }
    } else if (savedMessages) {
      // Migration: Create a session from existing messages
      try {
        const oldMessages = JSON.parse(savedMessages);
        const newSession: ChatSession = {
          id: crypto.randomUUID(),
          title: "Previous Chat",
          messages: oldMessages,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setSessions([newSession]);
        setCurrentSessionId(newSession.id);
      } catch (e) {
         createNewChat();
      }
    } else {
      createNewChat();
    }

    const savedUserName = localStorage.getItem("user_name");
    if (savedUserName) {
      setUserName(savedUserName);
    }
    setIsInitialized(true);
  }, []);

  // Sync messages with current session
  useEffect(() => {
    if (currentSessionId && sessions.length > 0) {
      const session = sessions.find(s => s.id === currentSessionId);
      if (session) {
        setMessages(session.messages);
      }
    }
  }, [currentSessionId]); // Intentionally not including sessions to avoid loop, we handle updates separately

  // Save sessions to local storage
  useEffect(() => {
    if (isInitialized && sessions.length > 0) {
      localStorage.setItem("chat_sessions", JSON.stringify(sessions));
    }
  }, [sessions, isInitialized]);

  // Save last session ID
  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem("last_session_id", currentSessionId);
    }
  }, [currentSessionId]);

  // Update current session when messages change
  useEffect(() => {
    if (!isInitialized || !currentSessionId) return;
    
    setSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        // Only update if messages are different to avoid infinite loops if we were depending on sessions in the message loader
        if (session.messages === messages) return session;
        
        // Update title based on first message if it's "New Chat"
        let title = session.title;
        if (messages.length > 0 && session.title === "New Chat") {
           const firstUserMsg = messages.find(m => m.role === 'user');
           if (firstUserMsg) {
             title = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? "..." : "");
           }
        }
        
        return {
          ...session,
          messages,
          title,
          updatedAt: Date.now()
        };
      }
      return session;
    }));
  }, [messages, isInitialized, currentSessionId]);

  const createNewChat = useCallback((options?: { force?: boolean }) => {
    // Check if we need to force creation (e.g. when deleting the last session)
    // If called from UI event, options will be the event object, so force will be false
    const shouldForce = options && typeof options === 'object' && 'force' in options ? options.force : false;

    // If not forced, prevent creating new chat if current one is already empty
    if (!shouldForce && messages.length === 0 && sessions.length > 0) {
      return;
    }

    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: "New Chat",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setMessages([]);
    setIsThinking(false); // Reset thinking state for new chat
  }, [messages, sessions]);

  const loadChat = useCallback((sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
    }
  }, [sessions]);

  const deleteSession = useCallback((sessionId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== sessionId);
      return filtered;
    });

    // Logic to switch session if current one was deleted
    if (sessionId === currentSessionId) {
        // We need access to the *new* sessions list, but state updates are async.
        // We can use the current 'sessions' state (which is pre-update) to calculate the next one.
        const remaining = sessions.filter(s => s.id !== sessionId);
        if (remaining.length > 0) {
            setCurrentSessionId(remaining[0].id);
        } else {
            createNewChat({ force: true });
        }
    }
  }, [sessions, currentSessionId, createNewChat]);

  // Save user name to local storage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("user_name", userName);
    }
  }, [userName, isInitialized]);

  // Save memories to local storage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("chat_memories", JSON.stringify(memories));
    }
  }, [memories, isInitialized]);

  const addMemory = useCallback((content: string) => {
    const newMemory: Memory = {
        id: crypto.randomUUID(),
        content,
        createdAt: Date.now()
    };
    setMemories(prev => [...prev, newMemory]);
  }, []);

  const deleteMemory = useCallback((id: string) => {
    setMemories(prev => prev.filter(m => m.id !== id));
  }, []);

  useEffect(() => {
    async function fetchModels() {
      setIsModelsLoading(true);
      try {
        const res = await fetch("/api/models");
        if (res.ok) {
          const data = await res.json();
          setModels(data.models);
        }
      } catch (error) {
        console.error("Failed to fetch models", error);
      } finally {
        setIsModelsLoading(false);
      }
    }

    fetchModels();
  }, []);

  // Auto-turn off thinking if model doesn't support it
  useEffect(() => {
    const model = models.find(m => m.id === selectedModel);
    if (model && !model.thinking && isThinking) {
      setIsThinking(false);
    }
  }, [selectedModel, models, isThinking]);

  // Resume stream if page reloaded mid-generation
  useEffect(() => {
    if (!isInitialized || messages.length === 0) return;

    const lastMsg = messages[messages.length - 1];
    // Only resume if:
    // 1. It's an assistant message
    // 2. It's marked as streaming
    // 3. We are NOT currently loading (meaning we just loaded this state from storage and aren't connected yet)
    // 4. It has a streamId
    if (lastMsg.role === 'assistant' && lastMsg.isStreaming && !isLoading && lastMsg.streamId) {
      console.log("Resuming interrupted stream:", lastMsg.streamId);
      
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setIsLoading(true);

      sendMessageToGemini(
        messages.slice(0, -1), // History excluding the interrupted bot message
        "", // New message is empty as we are resuming
        selectedModel,
        isThinking,
        chatMode,
        memories.map(m => m.content),
        [], // images (empty for resume)
        (data) => {
          setMessages(prev => prev.map(msg => 
            msg.id === lastMsg.id 
              ? { ...msg, content: data.response, thoughts: data.thoughts, isStreaming: true, relatedQuestions: data.relatedQuestions }
              : msg
          ));
        },
        controller.signal,
        { streamId: lastMsg.streamId, resume: true }
      ).then((final) => {
        setMessages(prev => prev.map(msg => 
          msg.id === lastMsg.id 
            ? { ...msg, content: final.response, thoughts: final.thoughts, isStreaming: false, relatedQuestions: final.relatedQuestions }
            : msg
        ));
        setIsLoading(false);
        abortControllerRef.current = null;
      }).catch(err => {
        console.error("Failed to resume stream:", err);
        setIsLoading(false);
        // Mark as failed/done if we can't resume
        setMessages(prev => prev.map(msg => 
          msg.id === lastMsg.id ? { ...msg, isStreaming: false } : msg
        ));
        abortControllerRef.current = null;
      });
    }
  }, [isInitialized, messages, isLoading]); // Re-check when messages load or initialization completes

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      
      // Remove the streaming bot message if it's empty
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.role === 'assistant' && !lastMsg.content && !lastMsg.thoughts) {
          return prev.slice(0, -1);
        }
        // Mark as not streaming
        return prev.map((msg, i) => 
          i === prev.length - 1 ? { ...msg, isStreaming: false } : msg
        );
      });
    }
  }, []);

  const sendMessage = useCallback(async (content: string, attachments: Attachment[] = []) => {
    if (!content.trim() && attachments.length === 0) return;
    if (isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      attachments,
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setIsThinking(false); // Reset thinking for new message unless model keeps it (handled by effect)

    const streamId = crypto.randomUUID();
    const botMessageId = crypto.randomUUID();

    const initialBotMessage: Message = {
      id: botMessageId,
      role: "assistant",
      content: "",
      isStreaming: true,
      createdAt: Date.now(),
      streamId,
    };

    setMessages((prev) => [...prev, initialBotMessage]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const { response, thoughts, relatedQuestions } = await sendMessageToGemini(
        [...messages, userMessage],
        content,
        selectedModel,
        isThinking,
        chatMode,
        memories.map(m => m.content),
        attachments,
        (data) => {
          setMessages((prev) => prev.map(msg =>
            msg.id === botMessageId
              ? { ...msg, content: data.response, thoughts: data.thoughts, isStreaming: true, relatedQuestions: data.relatedQuestions }
              : msg
          ));
        },
        controller.signal,
        { streamId, resume: false }
      );

      // Check for memory block in the final response
      let finalResponse = response;
      const memoryMatch = finalResponse.match(/\[\[MEMORY:\s*(.*?)\]\]/s);
      if (memoryMatch) {
          const memoryContent = memoryMatch[1].trim();
          addMemory(memoryContent);
          finalResponse = finalResponse.replace(/\[\[MEMORY:\s*.*?\]\]/s, "").trim();
      }

      // Ensure final state is set (in case of any missed updates, though unlikely with await)
      setMessages((prev) => prev.map(msg =>
        msg.id === botMessageId
          ? { ...msg, content: finalResponse, thoughts: thoughts, isStreaming: false, relatedQuestions: relatedQuestions }
          : msg
      ));
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setMessages((prev) => prev.map(msg =>
          msg.id === botMessageId
            ? { ...msg, isStreaming: false }
            : msg
        ));
        return;
      }

      console.error("Failed to send message:", error);

      let errorContent = `**Error**: ${error.message || "Sorry, I encountered an error processing your request."}`;

      if (error.status === 429) {
        errorContent = `**Quota Exceeded**: You have reached the rate limit for model **${selectedModel}**. \n\nPlease try:
*   Waiting a few moments
*   Switching to a different model (e.g., **Gemini 2.5 Flash**)
*   Checking your Google Cloud billing/quota settings`;
      } else if (error.status === 503) {
        errorContent = `**Service Unavailable**: The AI service is currently overloaded. Please try again later.`;
      } else if (error.message && (error.message.includes("Failed to fetch") || error.message.includes("NetworkError"))) {
        errorContent = `**Network Error**: Could not connect to the server. The model might be crashing or the connection was lost. Please try again.`;
      }

      setMessages((prev) => prev.map(msg =>
        msg.id === botMessageId
          ? { ...msg, content: errorContent, isStreaming: false }
          : msg
      ));
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [messages, selectedModel, isThinking, chatMode, memories, addMemory]);

  const clearChat = useCallback(() => {
    setMessages([]);
    // Update the session as well
    setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [] } : s));
  }, [currentSessionId]);

  return {
    messages,
    sessions,
    currentSessionId,
    loadChat,
    createNewChat,
    deleteSession,
    isLoading,
    sendMessage,
    clearChat,
    selectedModel,
    setSelectedModel,
    isThinking,
    setIsThinking,
    models,
    isModelsLoading,
    userName,
    setUserName,
    chatMode,
    setChatMode,
    memories,
    addMemory,
    deleteMemory,
    stopGeneration
  };
}

