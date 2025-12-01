"use client"

import * as React from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { useArtifact } from "@/contexts/ArtifactContext"
import { ArtifactViewer } from "@/features/artifacts/ArtifactViewer"
import { Message } from "@/types/chat"

interface ChatLayoutProps {
  children: React.ReactNode
  messages: Message[]
}

export function ChatLayout({ children, messages }: ChatLayoutProps) {
  const { isOpen } = useArtifact()

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full w-full" suppressHydrationWarning>
      <ResizablePanel id="chat-panel" order={1} defaultSize={isOpen ? 60 : 100} minSize={30} className="flex flex-col h-full" suppressHydrationWarning>
        {children}
      </ResizablePanel>
      {isOpen && (
        <>
            <ResizableHandle withHandle />
            <ResizablePanel id="artifact-panel" order={2} defaultSize={40} minSize={20} maxSize={80} suppressHydrationWarning>
                <ArtifactViewer messages={messages} />
            </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  )
}
