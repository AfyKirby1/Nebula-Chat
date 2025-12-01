import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/Button"
import { Textarea } from "@/components/ui/Textarea"
import { X, Copy, Code, Eye, Edit, Save, RotateCcw, Terminal, Sparkles, Layout, FileCode, ArrowLeft, Box, Maximize2, Minimize2, FileType, Braces, FileJson } from "lucide-react"
import { useArtifact, Artifact } from "@/contexts/ArtifactContext"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Message } from "@/types/chat"
import { extractArtifactsFromMessages } from "@/lib/artifacts"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface ArtifactViewerProps {
  messages?: Message[]
}

export function ArtifactViewer({ messages = [] }: ArtifactViewerProps) {
  const { currentArtifact, closeArtifact, updateArtifact, openArtifact, deselectArtifact } = useArtifact()
  const [activeTab, setActiveTab] = React.useState("preview")
  const [isEditing, setIsEditing] = React.useState(false)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [editContent, setEditContent] = React.useState("")
  const [logs, setLogs] = React.useState<Array<{ type: string, args: string[] }>>([])

  const artifacts = React.useMemo(() => extractArtifactsFromMessages(messages), [messages]);

  // Resolve the "live" version of the current artifact to support streaming updates
  const liveArtifact = React.useMemo(() => {
    if (!currentArtifact) return null;
    return artifacts.find(a => a.id === currentArtifact.id) || currentArtifact;
  }, [currentArtifact, artifacts]);

  // Fusion Engine: Resolve related artifacts (HTML, CSS, JS)
  const { htmlArtifact, cssArtifacts, jsArtifacts, cssContent, jsContent } = React.useMemo(() => {
    if (!liveArtifact) return { htmlArtifact: null, cssArtifacts: [], jsArtifacts: [], cssContent: "", jsContent: "" };

    const getMsgId = (id: string) => {
        const parts = id.split('-');
        return parts.slice(0, -1).join('-');
    }
    const currentMsgId = getMsgId(liveArtifact.id);
    
    // Get all artifacts from the same message, sorted Oldest -> Newest (Top -> Bottom) for merging
    // Note: 'artifacts' is Newest -> Oldest. 
    const siblings = artifacts.filter(a => getMsgId(a.id) === currentMsgId);
    const orderedSiblings = [...siblings].reverse();
    
    // 1. HTML
    let html = orderedSiblings.find(a => a.type === 'html' || a.language === 'html');
    
    if (liveArtifact.type === 'html' || liveArtifact.language === 'html') {
        html = liveArtifact;
    } else if (!html) {
        // Smart History Search: Look for most recent HTML in past messages
        const currentIndex = artifacts.findIndex(a => a.id === liveArtifact.id);
        if (currentIndex !== -1) {
            const historicalHtml = artifacts.slice(currentIndex + 1).find(a => a.type === 'html' || a.language === 'html');
            if (historicalHtml) {
                html = historicalHtml;
            }
        }
    }

    // 2. CSS & JS
    const css = orderedSiblings.filter(a => a.language === 'css');
    const js = orderedSiblings.filter(a => ['js', 'javascript', 'ts', 'typescript', 'jsx', 'tsx', 'react'].includes(a.language));

    // Content helpers
    const getContent = (a: Artifact) => a.content;
    
    return {
        htmlArtifact: html,
        cssArtifacts: css,
        jsArtifacts: js,
        cssContent: css.map(getContent).join('\n/* --- Merged CSS --- */\n'),
        jsContent: js.map(getContent).join('\n/* --- Merged JS --- */\n')
    };
  }, [liveArtifact, artifacts]);

  // Set initial tab based on artifact type
  React.useEffect(() => {
    if (currentArtifact) {
        const lang = currentArtifact.language?.toLowerCase();
        if (currentArtifact.type === 'html' || lang === 'html') setActiveTab('html');
        else if (lang === 'css') setActiveTab('css');
        else if (['javascript', 'js', 'ts', 'typescript', 'jsx', 'tsx', 'react'].includes(lang || '')) setActiveTab('js');
        else setActiveTab('preview'); // Default fallback
        
        setEditContent(currentArtifact.content)
        setIsEditing(false)
        setLogs([])
    }
  }, [currentArtifact?.id]) // Only change when ID changes, not content updates

  // Update edit content when switching tabs if not editing
  React.useEffect(() => {
      if (!isEditing) {
          if (activeTab === 'html' && htmlArtifact) setEditContent(htmlArtifact.content);
          else if (activeTab === 'css' && cssArtifacts.length > 0) setEditContent(cssContent); // Showing merged for now
          else if (activeTab === 'js' && jsArtifacts.length > 0) setEditContent(jsContent); // Showing merged for now
      }
  }, [activeTab, htmlArtifact, cssContent, jsContent, isEditing])


  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'console') {
        setLogs(prev => [...prev, { type: event.data.method, args: event.data.args }])
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const handleSave = () => {
    // Saving logic is tricky with merged content. 
    // For now, if we are in a specific tab, we update the PRIMARY artifact of that type.
    // If multiple exist (merged), we might just update the first one or the "live" one if it matches.
    
    let targetArtifact: Artifact | undefined;
    
    if (activeTab === 'html') targetArtifact = htmlArtifact ?? undefined;
    else if (activeTab === 'css') targetArtifact = cssArtifacts[0]; // Simplification
    else if (activeTab === 'js') targetArtifact = jsArtifacts[0];   // Simplification
    
    if (targetArtifact) {
      // We need to call updateArtifact but that method in context updates 'currentArtifact'.
      // If 'currentArtifact' is NOT the one we are editing (e.g. editing HTML tab while CSS file is "selected"), 
      // we can't use updateArtifact directly if it only updates the selected one.
      // However, for this MVP, let's assume we only save if we are editing the *current* artifact.
      
      if (targetArtifact.id === currentArtifact?.id) {
          updateArtifact(editContent)
          toast.success("Artifact updated")
      } else {
          toast.error("Can only save the currently selected file. Switch to it in the list to save.")
      }
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset content
    if (activeTab === 'html' && htmlArtifact) setEditContent(htmlArtifact.content);
    else if (activeTab === 'css') setEditContent(cssContent);
    else if (activeTab === 'js') setEditContent(jsContent);
  }

  const getPreviewContent = () => {
    if (!liveArtifact) return "";
    
    const consoleScript = `
      <script>
        const consoleProxy = new Proxy(console, {
          get(target, prop) {
            if (['log', 'error', 'warn', 'info'].includes(prop)) {
              return (...args) => {
                window.parent.postMessage({ type: 'console', method: prop, args: args.map(a => String(a)) }, '*');
                target[prop](...args);
              }
            }
            return target[prop];
          }
        });
        window.console = consoleProxy;
        window.onerror = (msg, url, line, col, error) => {
          window.parent.postMessage({ type: 'console', method: 'error', args: [msg] }, '*');
        };
      </script>
    `;

    // Use the resolved artifacts
    let doc = htmlArtifact ? htmlArtifact.content : "";

    // Fallback for standalone CSS/JS if no HTML found
    if (!doc) {
        if (liveArtifact.language === 'css') {
            return `<html><head>${consoleScript}<style>${liveArtifact.content}</style></head><body><div class="preview-content" style="padding: 2rem; font-family: system-ui, sans-serif;"><h1>CSS Preview</h1><p>No HTML context found. Displaying sample elements.</p><button>Button</button><div class="card">Card</div></div></body></html>`;
        }
        if (['js', 'javascript', 'ts', 'typescript', 'jsx', 'tsx', 'react'].includes(liveArtifact.language)) {
             doc = `<html><body><div id="root"></div></body></html>`; 
        } else {
             return liveArtifact.content;
        }
    }

    // Sanitize
    if (jsContent) {
        doc = doc.replace(/<script\s+[^>]*src=["'](?!https?:\/\/)[^"']*["'][^>]*>[\s\S]*?<\/script>/gi, '<!-- Replaced local script -->');
        doc = doc.replace(/<script\s+[^>]*src=["'](?!https?:\/\/)[^"']*["'][^>]*\/>/gi, '<!-- Replaced local script -->');
    }
    if (cssContent) {
         doc = doc.replace(/<link\s+[^>]*rel=["']stylesheet["'][^>]*href=["'](?!https?:\/\/)[^"']*["'][^>]*>/gi, '<!-- Replaced local stylesheet -->');
    }

    // Inject CSS
    if (cssContent) {
        const styleTag = `<style>\n/* Injected from Nebula */\n${cssContent}\n</style>`;
        if (doc.includes('</head>')) {
            doc = doc.replace('</head>', `${styleTag}</head>`);
        } else if (doc.includes('<html>')) {
             doc = doc.replace('<html>', `<html><head>${styleTag}</head>`);
        } else {
            doc = `${styleTag}${doc}`;
        }
    }

    // Inject Console Script
    if (doc.includes('<head>')) {
      doc = doc.replace('<head>', `<head>${consoleScript}`);
    } else if (doc.includes('<body>')) {
      doc = doc.replace('<body>', `<body>${consoleScript}`);
    } else {
      doc = `${consoleScript}${doc}`;
    }

    // Inject JS
    if (jsContent) {
        const isReact = ['jsx', 'tsx', 'react'].includes(liveArtifact?.language || '') || 
                       jsArtifacts.some(a => ['jsx', 'tsx', 'react'].includes(a.language)) ||
                       jsContent.includes('import React') || jsContent.includes('export default function');

        let scriptTag = '';
        
        if (isReact) {
            const babelScripts = `
                <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
                <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
                <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
            `;
            
            if (!doc.includes('react.development.js')) {
                 if (doc.includes('</head>')) {
                    doc = doc.replace('</head>', `${babelScripts}</head>`);
                 } else {
                    doc = `${babelScripts}${doc}`;
                 }
            }

            let processedJs = jsContent
                .replace(/import\s+React\s*(?:,\s*\{[^}]*\})?\s*from\s*['"]react['"];?/g, '')
                .replace(/import\s+(?:ReactDOM|\{[^}]*\})\s*from\s*['"]react-dom(?:\/client)?['"];?/g, '')
                .replace(/export\s+default\s+function\s+(\w+)/, 'function $1')
                .replace(/export\s+default\s+(\w+);?/, '');

            if (!processedJs.includes('createRoot') && !processedJs.includes('ReactDOM.render')) {
                const match = processedJs.match(/function\s+([A-Z]\w+)/);
                if (match) {
                    processedJs += `\n\nconst root = ReactDOM.createRoot(document.getElementById('root') || document.body.appendChild(document.createElement('div')));\nroot.render(<${match[1]} />);`;
                }
            }

            scriptTag = `<script type="text/babel" data-presets="react,env">\n/* Injected from Nebula (React Mode) */\n${processedJs}\n</script>`;
        } else {
            scriptTag = `<script>\n/* Injected from Nebula */\n${jsContent}\n</script>`;
        }

        if (doc.includes('</body>')) {
            doc = doc.replace('</body>', `${scriptTag}</body>`);
        } else {
            doc = `${doc}${scriptTag}`;
        }
    }

    return doc;
  }

  // Dashboard View (Nebula)
  if (!currentArtifact) {
    return (
      <div className="h-full flex flex-col bg-background border-l border-border w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0 bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-500/10 rounded-md">
              <Sparkles className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <h2 className="font-semibold text-sm bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">Nebula</h2>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={closeArtifact}>
            <X size={14} />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {artifacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 p-8 opacity-60">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium text-sm">Your Nebula is empty</h3>
                <p className="text-xs text-muted-foreground max-w-[200px]">
                  Ask Otter Chat to generate code, HTML, or React components to see them here.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {artifacts.map((artifact) => (
                <div 
                  key={artifact.id}
                  onClick={() => openArtifact(artifact)}
                  className="group relative flex flex-col gap-3 p-3 rounded-lg border border-border bg-card hover:border-indigo-500/50 hover:bg-muted/50 transition-all cursor-pointer shadow-sm hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "p-1.5 rounded-md shrink-0",
                        artifact.type === 'html' ? "bg-orange-500/10 text-orange-500" :
                        artifact.language === 'react' || artifact.language === 'tsx' ? "bg-blue-500/10 text-blue-500" :
                        "bg-yellow-500/10 text-yellow-500"
                      )}>
                        {artifact.type === 'html' ? <Layout size={14} /> : <FileCode size={14} />}
                      </div>
                      <span className="text-xs font-medium truncate max-w-[150px]">{artifact.title}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-muted">
                      {artifact.language}
                    </span>
                  </div>
                  
                  <div className="bg-muted/50 rounded-md p-2 overflow-hidden h-16 relative group-hover:bg-muted transition-colors">
                    <pre className="text-[10px] text-muted-foreground font-mono leading-relaxed opacity-70">
                      {artifact.content.slice(0, 150)}
                    </pre>
                    <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{new Date(artifact.createdAt || Date.now()).toLocaleDateString()}</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500 font-medium flex items-center gap-1">
                      Open <ArrowLeft size={10} className="rotate-180" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Editor / Preview View
  return (
    <div className={cn(
      "h-full flex flex-col border-l border-border bg-background w-full transition-all duration-200 ease-in-out",
      isFullscreen && "fixed inset-0 z-50 border-l-0"
    )}>
      {/* Header Bar */}
      <div className="flex items-center justify-between p-4 border-b border-border shrink-0 bg-muted/20">
        <div className="flex items-center gap-2 overflow-hidden">
             <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 mr-1" onClick={deselectArtifact} title="Back to Nebula">
                <ArrowLeft size={14} />
             </Button>
             <div className="flex items-center gap-2 mr-2">
                <div className="p-1 bg-indigo-500/10 rounded-md">
                    <Sparkles className="w-3 h-3 text-indigo-500" />
                </div>
                <span className="font-semibold text-sm bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                    Code Editor & Preview
                </span>
             </div>
        </div>
        <div className="flex items-center gap-1">
           <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsFullscreen(!isFullscreen)} title={isFullscreen ? "Exit Full Screen" : "Full Screen"}>
             {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
           </Button>
           <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
             navigator.clipboard.writeText(currentArtifact.content);
             toast.success("Copied to clipboard");
           }}>
             <Copy size={14} />
           </Button>
           <Button variant="ghost" size="icon" className="h-8 w-8" onClick={closeArtifact}>
             <X size={14} />
           </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 pt-2 shrink-0 border-b border-border/50">
          <TabsList className="grid w-full grid-cols-4 h-9">
            <TabsTrigger 
              value="html" 
              className="text-xs"
              disabled={!htmlArtifact}
            >
              <Layout size={12} className="mr-2" /> HTML
            </TabsTrigger>
            <TabsTrigger 
                value="css" 
                className="text-xs"
                disabled={cssArtifacts.length === 0}
            >
              <FileType size={12} className="mr-2" /> CSS
            </TabsTrigger>
            <TabsTrigger 
                value="js" 
                className="text-xs"
                disabled={jsArtifacts.length === 0}
            >
              <Braces size={12} className="mr-2" /> JS
            </TabsTrigger>
            <TabsTrigger 
              value="preview" 
              className="text-xs"
            >
              <Eye size={12} className="mr-2" /> Preview
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Preview Tab */}
        <TabsContent value="preview" className="flex-1 p-0 overflow-hidden h-full data-[state=inactive]:hidden mt-0 bg-white relative">
          <iframe 
            srcDoc={getPreviewContent()}
            className="w-full h-full border-0"
            title="Preview"
            sandbox="allow-scripts allow-modals allow-forms allow-popups" 
          />
          {/* Console Overlay Button */}
           <div className="absolute bottom-4 right-4">
               <Button 
                 variant="secondary" 
                 size="sm" 
                 className="shadow-lg text-xs h-7 gap-2 bg-black/80 text-white hover:bg-black"
                 onClick={() => setActiveTab('console')}
               >
                   <Terminal size={12} /> Console 
                   {logs.length > 0 && <span className="px-1.5 py-0.5 bg-red-500 rounded-full text-[9px]">{logs.length}</span>}
               </Button>
           </div>
        </TabsContent>

        {/* Console Tab (hidden from main tabs list but accessible) */}
        <TabsContent value="console" className="flex-1 p-0 overflow-hidden h-full data-[state=inactive]:hidden mt-0 flex flex-col bg-black text-green-400 font-mono text-xs">
            <div className="flex items-center justify-between p-2 border-b border-gray-800 bg-gray-900">
                <span className="font-semibold pl-2">Console Output</span>
                <Button variant="ghost" size="sm" className="h-6 w-6 text-gray-400 hover:text-white" onClick={() => setActiveTab('preview')}>
                    <X size={14} />
                </Button>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-1">
                {logs.length === 0 ? (
                    <div className="text-gray-500 italic">No logs yet...</div>
                ) : (
                    logs.map((log, i) => (
                        <div key={i} className={cn("border-b border-gray-800 pb-1", log.type === 'error' && "text-red-400", log.type === 'warn' && "text-yellow-400")}>
                            <span className="opacity-50 mr-2">[{log.type}]</span>
                            <span>{log.args.join(' ')}</span>
                        </div>
                    ))
                )}
            </div>
        </TabsContent>
        
        {/* Code Tabs (HTML, CSS, JS) */}
        {['html', 'css', 'js'].map((tab) => (
            <TabsContent key={tab} value={tab} className="flex-1 p-0 overflow-hidden h-full data-[state=inactive]:hidden mt-0 flex flex-col">
              <div className="flex items-center justify-end gap-2 p-2 border-b border-border/50 bg-muted/10">
                 {isEditing ? (
                   <>
                     <Button size="sm" variant="outline" onClick={handleCancel} className="h-7 text-xs gap-1">
                       <RotateCcw size={12} /> Cancel
                     </Button>
                     <Button size="sm" onClick={handleSave} className="h-7 text-xs gap-1">
                       <Save size={12} /> Save
                     </Button>
                   </>
                 ) : (
                   <Button size="sm" variant="secondary" onClick={() => setIsEditing(true)} className="h-7 text-xs gap-1">
                     <Edit size={12} /> Edit
                   </Button>
                 )}
              </div>
              
              {isEditing ? (
                 <Textarea 
                   value={editContent} 
                   onChange={(e) => setEditContent(e.target.value)} 
                   className="flex-1 font-mono text-xs leading-normal resize-none p-4 bg-muted/50 focus-visible:ring-0 border-0 rounded-none"
                   spellCheck={false}
                 />
              ) : (
                 <div className="flex-1 w-full overflow-auto bg-[#1e1e1e]">
                   <SyntaxHighlighter
                       language={tab === 'js' ? 'javascript' : tab}
                       style={vscDarkPlus}
                       customStyle={{
                           margin: 0,
                           padding: '1rem',
                           height: '100%', // Ensure it fills the container
                           fontSize: '0.75rem',
                           lineHeight: '1.5',
                       }}
                       showLineNumbers={true}
                       wrapLines={true}
                   >
                       {tab === 'html' ? (htmlArtifact?.content || '') : (tab === 'css' ? cssContent : jsContent)}
                   </SyntaxHighlighter>
                 </div>
              )}
            </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
