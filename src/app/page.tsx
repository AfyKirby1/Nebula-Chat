"use client"

import { useRef, useEffect } from "react"
import { useChat } from "@/hooks/useChat"
import { MessageList } from "@/features/chat/MessageList"
import { ChatInput, ChatInputHandle } from "@/features/chat/ChatInput"
import { ChatLayout } from "@/features/chat/ChatLayout"
import { Sidebar } from "@/features/chat/Sidebar"
import { ArtifactProvider, useArtifact } from "@/contexts/ArtifactContext"
import { extractArtifactsFromMessages } from "@/lib/artifacts"

function ChatInterface() {
  const {
    messages,
    sessions,
    currentSessionId,
    loadChat,
    createNewChat,
    deleteSession,
    isLoading,
    sendMessage,
    selectedModel,
    setSelectedModel,
    isThinking,
    setIsThinking,
    models,
    isModelsLoading,
    clearChat,
    userName,
    setUserName,
    chatMode,
    setChatMode,
    memories,
    addMemory,
    deleteMemory,
    stopGeneration
  } = useChat()

  const { openArtifact } = useArtifact()
  const prevIsLoading = useRef(isLoading)

  useEffect(() => {
    if (prevIsLoading.current && !isLoading) {
      // Just finished loading
      const lastMsg = messages[messages.length - 1]
      if (lastMsg && lastMsg.role === 'assistant') {
        const artifacts = extractArtifactsFromMessages([lastMsg])
        const htmlArtifact = artifacts.find(a => a.type === 'html')
        if (htmlArtifact) {
          openArtifact(htmlArtifact)
        }
      }
    }
    prevIsLoading.current = isLoading
  }, [isLoading, messages, openArtifact])

  const chatInputRef = useRef<ChatInputHandle>(null)

  const handleEdit = (content: string) => {
    if (chatInputRef.current) {
      chatInputRef.current.setValue(content)
      chatInputRef.current.focus()
    }
  }

  const selectedModelData = models.find(m => m.id === selectedModel);
  const supportsThinking = selectedModelData?.thinking ?? false;

  return (
    <div className="flex h-screen bg-transparent overflow-hidden" suppressHydrationWarning>
      <Sidebar 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onLoadSession={loadChat}
        onDeleteSession={deleteSession}
        onNewChat={createNewChat}
        userName={userName}
        setUserName={setUserName}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        models={models}
        isModelsLoading={isModelsLoading}
        chatMode={chatMode}
        setChatMode={setChatMode}
        memories={memories}
        onAddMemory={addMemory}
        onDeleteMemory={deleteMemory}
      />
      
      <div className="flex-1 flex flex-col h-full min-w-0 relative" suppressHydrationWarning>
        {/* Chat Area */}
        <main className="flex-1 overflow-hidden relative w-full" suppressHydrationWarning>
          <ChatLayout messages={messages}>
            <div className="flex flex-col h-full max-w-5xl mx-auto w-full relative" suppressHydrationWarning>
              <MessageList 
                messages={messages} 
                isLoading={isLoading} 
                isThinking={isThinking} 
                onQuestionClick={sendMessage}
                userName={userName}
                onEdit={handleEdit}
              />

              <div className="w-full" suppressHydrationWarning>
                <ChatInput
                  ref={chatInputRef}
                  onSend={sendMessage}
                  onStop={stopGeneration}
                  disabled={isLoading}
                  isThinking={isThinking}
                  onThinkingChange={setIsThinking}
                  supportsThinking={supportsThinking}
                />
              </div>
            </div>
          </ChatLayout>
        </main>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <ArtifactProvider>
      <ChatInterface />
    </ArtifactProvider>
  )
}


