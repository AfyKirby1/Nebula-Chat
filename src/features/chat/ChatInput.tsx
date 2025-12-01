import * as React from "react"
import { SendHorizontal, Mic, Image as ImageIcon, Brain, Octagon, MicOff, X, Paperclip, FileText } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Textarea } from "@/components/ui/Textarea"
import { Switch } from "@/components/ui/Switch"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useSpeechToText } from "@/hooks/useSpeechToText"
import { Attachment } from "@/types/chat"

interface ChatInputProps {
  onSend: (message: string, attachments: Attachment[]) => void
  onStop?: () => void
  disabled?: boolean
  isThinking?: boolean
  onThinkingChange?: (isThinking: boolean) => void
  supportsThinking?: boolean
}

export interface ChatInputHandle {
  setValue: (value: string) => void
  focus: () => void
}

export const ChatInput = React.forwardRef<ChatInputHandle, ChatInputProps>(({ onSend, onStop, disabled, isThinking, onThinkingChange, supportsThinking }, ref) => {
  const [input, setInput] = React.useState("")
  const [attachments, setAttachments] = React.useState<Attachment[]>([])
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useImperativeHandle(ref, () => ({
    setValue: (value: string) => {
      setInput(value)
      // Adjust height after value update
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto"
          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
        }
      }, 0)
    },
    focus: () => {
      textareaRef.current?.focus()
    }
  }))

  const handleSend = () => {
    if (input.trim() || attachments.length > 0) {
      onSend(input, attachments)
      setInput("")
      setAttachments([])
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          // Extract base64 data (remove "data:xxx;base64," prefix)
          const base64 = result.split(',')[1];

          setAttachments(prev => [...prev, {
            data: base64,
            mimeType: file.type,
            name: file.name
          }]);
        };
        reader.readAsDataURL(file);
      });
    }
    // Reset input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }

  const { isListening, toggleListening, isSupported } = useSpeechToText({
    onTranscript: (transcript) => {
      setInput(prev => {
        const newValue = prev ? `${prev} ${transcript}` : transcript;
        // We need to manually trigger height adjustment since state update is async
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.style.height = "auto"
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
          }
        }, 0);
        return newValue;
      });
    }
  });

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }

  React.useEffect(() => {
    adjustHeight()
  }, [input])

  return (
    <div className="bg-background w-full max-w-4xl mx-auto pb-6 px-4" suppressHydrationWarning>
      <motion.div
        className={cn(
          "relative flex flex-col rounded-3xl bg-muted/50 transition-all duration-200 focus-within:bg-muted/80 focus-within:shadow-md",
          "border border-transparent focus-within:border-ring/30 focus-within:ring-1 focus-within:ring-primary/20"
        )}
        suppressHydrationWarning
        initial={false}
      >
        {/* Attachment Previews */}
        {attachments.length > 0 && (
          <div className="flex gap-2 px-4 pt-4 overflow-x-auto">
            {attachments.map((att, index) => (
              <div key={index} className="relative group shrink-0">
                {att.mimeType.startsWith('image/') ? (
                  <img
                    src={`data:${att.mimeType};base64,${att.data}`}
                    alt={att.name}
                    className="h-16 w-16 object-cover rounded-lg border border-border/50"
                  />
                ) : (
                  <div className="h-16 w-16 flex flex-col items-center justify-center bg-muted/50 rounded-lg border border-border/50 p-1" title={att.name}>
                    <FileText size={24} className="text-muted-foreground mb-1" />
                    <span className="text-[8px] text-muted-foreground w-full truncate text-center leading-tight px-0.5">{att.name || 'File'}</span>
                  </div>
                )}
                <button
                  onClick={() => removeAttachment(index)}
                  className="absolute -top-1.5 -right-1.5 bg-background border border-border rounded-full p-0.5 text-muted-foreground hover:text-foreground shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <Textarea
          ref={textareaRef}
          id="chat-input"
          name="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Nebula Chat..."
          className="min-h-[56px] max-h-[200px] w-full resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 py-4 pl-4 pr-14 text-base"
          disabled={disabled}
          rows={1}
          aria-label="Chat Input"
        />

        <div
          className="flex justify-between items-center px-2 pb-2"
          suppressHydrationWarning
        >
          <div className="flex items-center gap-1">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              style={{ display: "none" }}
              multiple
              onChange={handleFileSelect}
              suppressHydrationWarning
            />
            <Button
              size="icon"
              variant="ghost"
              className="text-muted-foreground rounded-full hover:text-foreground"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              title="Attach files"
            >
              <Paperclip size={20} />
            </Button>
            {isSupported && (
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "rounded-full transition-colors",
                  isListening ? "text-red-500 hover:text-red-600 bg-red-100/10" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={toggleListening}
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? <MicOff size={20} className="animate-pulse" /> : <Mic size={20} />}
              </Button>
            )}

            {supportsThinking && (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border/40 animate-in fade-in duration-300">
                <div className="flex items-center gap-1.5 cursor-pointer group" onClick={() => onThinkingChange?.(!isThinking)}>
                  <Switch
                    checked={isThinking}
                    onCheckedChange={onThinkingChange}
                    disabled={disabled}
                    className="scale-75 data-[state=checked]:bg-purple-600"
                  />
                  <div className={`flex items-center gap-1 text-xs font-medium transition-colors ${isThinking ? "text-purple-600" : "text-muted-foreground group-hover:text-foreground"}`}>
                    <motion.div
                      animate={isThinking ? { scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] } : {}}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <Brain size={14} />
                    </motion.div>
                    <span className="hidden sm:inline">Thinking</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div suppressHydrationWarning>
            {disabled && onStop ? (
              <Button
                size="icon"
                variant="ghost"
                onClick={onStop}
                className="h-10 w-10 shrink-0 rounded-full transition-all text-red-500 hover:text-red-600 hover:bg-red-100/10"
              >
                <Octagon size={20} fill="currentColor" />
              </Button>
            ) : (
              <Button
                size="icon"
                variant={input.trim() ? "default" : "ghost"}
                disabled={disabled || !input.trim()}
                onClick={handleSend}
                className={cn(
                  "h-10 w-10 shrink-0 rounded-full transition-all",
                  !input.trim() && "text-muted-foreground"
                )}
              >
                <SendHorizontal size={20} />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
      <div className="mx-auto max-w-3xl px-4 py-3 text-center text-xs text-muted-foreground" suppressHydrationWarning>
        AI LLMs chat models can make mistakes.
      </div>
    </div>
  )
})
