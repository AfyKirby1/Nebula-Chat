import * as React from "react"
import { MessageBubble } from "./MessageBubble"
import { Message } from "@/types/chat"
import { Loader2, ArrowDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/Button"

interface MessageListProps {
  messages: Message[]
  isLoading?: boolean
  isThinking?: boolean
  onQuestionClick?: (question: string) => void
  userName?: string
  onEdit?: (content: string) => void
}

export function MessageList({ messages, isLoading, isThinking, onQuestionClick, userName = "Human", onEdit }: MessageListProps) {
  const bottomRef = React.useRef<HTMLDivElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = React.useState(false)

  React.useEffect(() => {
    if (!showScrollButton) {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isLoading, showScrollButton])

  const handleScroll = () => {
    if (!containerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight
    setShowScrollButton(distanceFromBottom > 200)
  }

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex flex-1 flex-col w-full overflow-y-auto py-4 relative scroll-smooth" 
        suppressHydrationWarning
    >
      {messages.length === 0 && !isLoading && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-1 flex-col items-center justify-center text-center p-8 opacity-50" 
          suppressHydrationWarning
        >
          <h2 className="text-4xl font-medium bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent mb-4" suppressHydrationWarning>Hello, {userName}</h2>
          <p className="text-xl text-muted-foreground" suppressHydrationWarning>How can I help you today?</p>
        </motion.div>
      )}

      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} onQuestionClick={onQuestionClick} onEdit={onEdit} />
      ))}

      {isLoading && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex w-full gap-4 p-4 max-w-3xl mx-auto"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background border border-border text-primary">
            <Loader2 className="animate-spin h-4 w-4" />
          </div>
          <div className="text-muted-foreground px-1 py-1">
            <div className="flex gap-1 items-center h-full">
              <span className="animate-pulse">{isThinking ? "Deep Thinking..." : "Thinking..."}</span>
            </div>
          </div>
        </motion.div>
      )}
      <div ref={bottomRef} className="h-4" />
      
      <AnimatePresence>
        {showScrollButton && (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="sticky bottom-6 left-0 right-0 flex justify-center pointer-events-none z-50"
            >
                <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full shadow-lg bg-primary/90 text-primary-foreground hover:bg-primary pointer-events-auto h-10 w-10 ring-1 ring-background/20"
                    onClick={scrollToBottom}
                >
                    <ArrowDown size={20} />
                </Button>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
