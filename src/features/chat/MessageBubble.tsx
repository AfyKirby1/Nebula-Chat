import * as React from "react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { cn } from "@/lib/utils"
import { Bot, User, Brain, ChevronDown, ChevronRight, Loader2, Eye, Code, FileText, Keyboard, MousePointerClick, Copy, RefreshCw, Sparkles, Edit2, Network, Volume2, Square } from "lucide-react"
import { useArtifact, Artifact } from "@/contexts/ArtifactContext"
import { Button } from "@/components/ui/Button"
import { Message } from "@/types/chat"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Mermaid } from "@/components/Mermaid"
import { useTextToSpeech, cleanMarkdown } from "@/hooks/useTextToSpeech"

interface MessageBubbleProps {
  message: Message
  onQuestionClick?: (question: string) => void
  onEdit?: (content: string) => void
}

// Helper to detect if content looks like a key press
const isKeyLike = (content: string) => {
  const trimmed = content.trim();
  
  // Common named keys
  const namedKeys = /^(Ctrl|Alt|Shift|Cmd|Esc|Enter|Tab|Backspace|Delete|Insert|Home|End|PageUp|PageDown|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Caps Lock|Num Lock|Scroll Lock|Pause|Print Screen|F\d{1,2}|Space)$/i;
  
  // Single uppercase letter or number (e.g. "A", "1") - avoid lowercase vars like "x"
  const singleChar = /^[A-Z0-9]$/;
  
  // Combinations starting with a modifier (e.g. "Ctrl+C", "Ctrl + Alt + Del")
  const combo = /^(Ctrl|Alt|Shift|Cmd|Meta|Super)\s*[+\-]\s*.+$/i;
  
  return (namedKeys.test(trimmed) || singleChar.test(trimmed) || (combo.test(trimmed) && trimmed.length < 20));
};

// Helper to detect if content looks like a filename
const isFileLike = (content: string) => {
  const files = /^[\w-]+\.(html|css|js|ts|tsx|jsx|json|md|txt|py|rb|go|rs|java|c|cpp|h)$/i;
  return files.test(content.trim());
};

interface CodeBlockProps extends React.HTMLAttributes<HTMLElement> {
  inline?: boolean
  children?: React.ReactNode
  openArtifact: (artifact: Artifact) => void
  isStreaming?: boolean
}

const CodeBlock = ({ inline, className, children, openArtifact, isStreaming, ...props }: CodeBlockProps) => {
  const match = /language-(\w+)/.exec(className || '')
  const language = match ? match[1] : ''
  const content = String(children).replace(/\n$/, '')
  const isArtifact = !inline && (language === 'html' || language === 'react' || language === 'jsx' || language === 'tsx' || language === 'javascript' || language === 'typescript' || language === 'css');
  const isMermaid = !inline && language === 'mermaid';
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  // Auto-collapse when streaming finishes (if it was an artifact)
  React.useEffect(() => {
      if (!isStreaming && isArtifact) {
          setIsCollapsed(true);
      }
  }, [isStreaming, isArtifact]);

  if (isMermaid) {
    return (
      <div className="my-4 rounded-lg border border-border bg-card shadow-sm overflow-hidden not-prose">
        <div 
          className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border/50 cursor-pointer hover:bg-muted/70 transition-colors"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
           <div className="flex items-center gap-2">
              <div className="text-muted-foreground transition-transform duration-200">
                 {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
              </div>
              <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center text-primary">
                 <Network size={14} />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase">Diagram</span>
           </div>
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden bg-background p-4"
            >
               <Mermaid chart={content} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

              // Handle file-like content in blocks (fixing "weird stuff" where filenames render as big code blocks)
              if (!inline && (!language || language === 'text') && isFileLike(content)) {
                  return (
                      <code className="px-1.5 py-0.5 mx-0.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 rounded-md inline-flex items-center gap-1.5 font-mono text-sm align-middle">
                          <FileText size={12} />
                          {content}
                      </code>
                  )
              }

              if (isArtifact) {
     return (
       <div className="my-4 rounded-lg border border-border bg-card shadow-sm overflow-hidden not-prose">
          <div 
            className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border/50 cursor-pointer hover:bg-muted/70 transition-colors"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
             <div className="flex items-center gap-2">
                <div className="text-muted-foreground transition-transform duration-200">
                   {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                </div>
                <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center text-primary">
                   {language === 'html' ? <Eye size={14} /> : <Code size={14} />}
                </div>
                <span className="text-xs font-medium text-muted-foreground uppercase">{language}</span>
             </div>
             <Button 
               variant="secondary" 
               size="sm" 
               onClick={(e) => {
                  e.stopPropagation();
                  openArtifact({ 
                   id: Date.now().toString(), 
                   title: "Generated Artifact", 
                   content, 
                   language, 
                   type: language === 'html' ? 'html' : 'code' 
                  })
               }}
               className="h-7 text-xs px-3"
             >
               {language === 'html' ? "Open Preview" : "Open Code"}
             </Button>
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="p-0 overflow-x-auto bg-[#1e1e1e]">
                   <SyntaxHighlighter
                     language={language}
                     style={vscDarkPlus}
                     customStyle={{ margin: 0, padding: '1rem', fontSize: '0.75rem', lineHeight: '1.5' }}
                     wrapLines={true}
                     wrapLongLines={true}
                     PreTag="div"
                   >
                     {String(children).replace(/\n$/, '')}
                   </SyntaxHighlighter>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
       </div>
     )
  }

  return !inline ? (
     <div className="my-4 rounded-lg border border-border bg-[#1e1e1e] shadow-sm overflow-hidden not-prose">
       <div className="flex items-center justify-between px-4 py-1.5 bg-muted/20 border-b border-white/5">
          <span className="text-[10px] font-medium text-muted-foreground uppercase">{language || 'text'}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={async () => {
               await navigator.clipboard.writeText(String(children));
            }}
            title="Copy code"
          >
             <Copy size={12} />
          </Button>
       </div>
       <SyntaxHighlighter
         language={language}
         style={vscDarkPlus}
         customStyle={{ margin: 0, padding: '1rem', fontSize: '0.75rem', lineHeight: '1.5' }}
         wrapLines={true}
         wrapLongLines={true}
         PreTag="div"
       >
         {String(children).replace(/\n$/, '')}
       </SyntaxHighlighter>
     </div>
  ) : (
     (() => {
        const textContent = String(children).trim();
        
        if (isKeyLike(textContent)) {
          return (
            <kbd className="px-1.5 py-0.5 mx-1 text-xs font-semibold text-muted-foreground bg-muted border border-border rounded-md shadow-sm select-none inline-flex items-center gap-1 align-middle font-mono">
               <Keyboard size={10} />
               {children}
            </kbd>
          )
        }
        
        if (isFileLike(textContent)) {
           return (
              <code className={cn(className, "px-1.5 py-0.5 mx-0.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 rounded-md inline-flex items-center gap-1.5")} {...props}>
                 <FileText size={12} />
                 {children}
              </code>
           )
        }

        return (
          <code className={className} {...props}>
            {children}
          </code>
        )
     })()
  )
}

export const MessageBubble = React.memo(function MessageBubble({ message, onQuestionClick, onEdit }: MessageBubbleProps) {
  const isUser = message.role === "user"
  const [isThinkingOpen, setIsThinkingOpen] = React.useState(true)
  const { openArtifact } = useArtifact()
  const { speak, cancel, isSpeaking } = useTextToSpeech()

  // Automatically open thinking if it's streaming
  React.useEffect(() => {
    if (message.isStreaming && message.thoughts) {
      setIsThinkingOpen(true)
    }
  }, [message.isStreaming, message.thoughts])

  const handleCopy = async () => {
    if (!message.content) return
    await navigator.clipboard.writeText(message.content)
    toast.success("Message copied to clipboard")
  }

  const hasThoughts = message.thoughts && message.thoughts.length > 0;
  const showThinking = hasThoughts || (message.isStreaming && message.role === "assistant" && !message.content);

  const markdownComponents = React.useMemo(() => ({
    pre({ children }: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      // The pre component receives the code element as a child
      // We intercept it to render our Block Code UI
      if (React.isValidElement(children)) {
        const { children: codeContent, className, ...rest } = children.props as any;
        return (
          <CodeBlock 
            inline={false} 
            className={className} 
            openArtifact={openArtifact} 
            isStreaming={message.isStreaming}
            {...rest}
          >
            {codeContent}
          </CodeBlock>
        );
      }
      return <>{children}</>;
    },
    code(props: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      // The code component is used for inline code
      // (Block code is handled by pre above)
      return <CodeBlock inline={true} {...props} openArtifact={openArtifact} isStreaming={message.isStreaming} />
    },
    strong({ children, ...props }: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        const textContent = String(children).trim().toLowerCase();
        if (textContent === 'left-click' || textContent === 'right-click' || textContent.includes('click')) {
            return (
                <strong className="font-semibold text-primary inline-flex items-center gap-1" {...props}>
                    <MousePointerClick size={14} className="inline-block" />
                    {children}
                </strong>
            )
        }
        return <strong {...props}>{children}</strong>
    },
    p({ children }: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      return <div className="mb-2 last:mb-0">{children}</div>
    }
  }), [openArtifact]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex w-full gap-4 p-4 max-w-3xl mx-auto group relative",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
      suppressHydrationWarning
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full overflow-hidden shadow-sm",
          isUser ? "bg-primary text-primary-foreground" : "bg-background border border-border text-primary"
        )}
      >
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>
      <div
        className={cn(
          "flex max-w-[85%] flex-col gap-1 min-w-0",
          isUser
            ? "bg-secondary text-secondary-foreground rounded-3xl rounded-tr-sm px-5 py-3"
            : "text-foreground px-1 py-1"
        )}
      >
        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className={cn("flex flex-wrap gap-2 mb-3", isUser ? "justify-end" : "justify-start")}>
            {message.attachments.map((att, index) => (
               <img 
                  key={index}
                  src={`data:${att.mimeType};base64,${att.data}`}
                  alt={att.name || 'Attachment'}
                  className="max-w-[200px] max-h-[200px] rounded-lg border border-white/10 object-cover shadow-sm bg-black/20"
                />
            ))}
          </div>
        )}

        {showThinking && (
          <div className="mb-2 rounded-lg border border-border/50 bg-muted/30 overflow-hidden animate-in fade-in slide-in-from-bottom-1 duration-300">
            <button
              onClick={() => setIsThinkingOpen(!isThinkingOpen)}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              <Brain size={14} className={cn(message.isStreaming && !message.content ? "animate-pulse text-purple-500" : "")} />
              <span className={cn(message.isStreaming && !message.content ? "bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-semibold" : "")}>
                {message.isStreaming && !message.content ? "Thinking Process..." : "Thinking Process"}
              </span>
              {message.isStreaming && <Loader2 size={12} className="animate-spin ml-1 opacity-50" />}
              {isThinkingOpen ? <ChevronDown size={14} className="ml-auto" /> : <ChevronRight size={14} className="ml-auto" />}
            </button>
            {isThinkingOpen && (
              <div className="px-3 pb-3 pt-0 text-xs text-muted-foreground border-t border-border/50 bg-muted/10 min-h-[20px]">
                {message.thoughts ? (
                  <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none leading-relaxed mt-2">
                    <ReactMarkdown>{message.thoughts}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 py-2 opacity-50 italic">
                    <span>Initializing thought process...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        <div className="prose prose-neutral dark:prose-invert max-w-none break-words leading-relaxed relative">
          <ReactMarkdown
            components={markdownComponents}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        {isUser && (
           <div className="flex items-center justify-end gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-background/20 rounded-full"
                onClick={() => onEdit?.(message.content)}
                title="Edit message"
              >
                <Edit2 size={12} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-background/20 rounded-full"
                onClick={handleCopy}
                title="Copy message"
              >
                <Copy size={12} />
              </Button>
           </div>
        )}
        {!isUser && !message.isStreaming && message.relatedQuestions && message.relatedQuestions.length > 0 && (
           <div className="mt-4 flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300 fill-mode-forwards opacity-0" style={{ animationFillMode: 'forwards' }}>
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                 <Sparkles size={12} className="text-yellow-500" />
                 <span>Related Questions</span>
              </div>
              <div className="flex flex-wrap gap-2">
                 {message.relatedQuestions.map((question, i) => (
                    <button
                       key={i}
                       onClick={() => onQuestionClick?.(question)}
                       className="text-xs bg-secondary/50 hover:bg-secondary text-secondary-foreground border border-border/50 px-3 py-1.5 rounded-full transition-colors text-left hover:scale-[1.02] active:scale-[0.98] duration-200"
                    >
                       {question}
                    </button>
                 ))}
              </div>
           </div>
        )}
        {!isUser && !message.isStreaming && message.content && (
           <div className="flex items-center justify-end gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-1">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full",
                  isSpeaking && "text-primary animate-pulse bg-primary/10"
                )}
                onClick={() => isSpeaking ? cancel() : speak(cleanMarkdown(message.content))}
                title={isSpeaking ? "Stop reading" : "Read aloud"}
              >
                {isSpeaking ? <Square size={12} fill="currentColor" /> : <Volume2 size={14} />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full"
                onClick={() => {
                    console.log("Regenerate requested for message", message.id);
                    // TODO: Implement regenerate functionality
                }}
                title="Regenerate response"
              >
                <RefreshCw size={12} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full"
                onClick={handleCopy}
                title="Copy message"
              >
                <Copy size={12} />
              </Button>
           </div>
        )}
      </div>
    </motion.div>
  )
});
