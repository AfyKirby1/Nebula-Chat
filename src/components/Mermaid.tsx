"use client"

import React, { useEffect, useState } from "react"
import mermaid from "mermaid"
import { motion } from "framer-motion"
import { ZoomIn, ZoomOut, Download } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface MermaidProps {
  chart: string
}

export function Mermaid({ chart }: MermaidProps) {
  const [svgContent, setSvgContent] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: document.documentElement.classList.contains("dark") ? "dark" : "default",
      securityLevel: "loose",
      fontFamily: "inherit",
    })

    const renderChart = async () => {
      try {
        // Helper to quote content safely
        const quoteContent = (content: string) => {
            const trimmed = content.trim();
            if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || 
                (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
                return content;
            }
            // Only quote if it contains a colon or quotes
            const needsQuoting = content.includes(':') || content.includes('"') || content.includes("'");
            
            if (!needsQuoting) return content;
            
            const safeContent = content.replace(/"/g, "'");
            return `"${safeContent}"`;
        };

        let fixedChart = chart
            // Fix 1: Trailing semicolons after node definitions
            .replace(/([\]\}\)])\s*;/g, '$1')
            
            // Fix 2: Specific Bracket Matching (More robust than catch-all)
            // Square Brackets [ ... ]
            .replace(/\[([^\[\]]+)\]/g, (match, content) => {
                return `[${quoteContent(content)}]`;
            })
            // Curly Braces { ... }
            .replace(/\{([^{}]+)\}/g, (match, content) => {
                return `{${quoteContent(content)}}`;
            })
            // Parentheses ( ... ) - Handles (Text: Value) but leaves ((...)) alone roughly
            .replace(/\(([^()]+)\)/g, (match, content) => {
                return `(${quoteContent(content)})`;
            })
            
            // Fix 3: Quote subgraph titles if they contain spaces and aren't already quoted
            // Matches 'subgraph' + space + anything until newline or semicolon
            .replace(/subgraph\s+([^\r\n;]+)/g, (match, title) => {
                const trimmedTitle = title.trim();
                if (/^["'].*["']$/.test(trimmedTitle) || /^[a-zA-Z0-9_]+$/.test(trimmedTitle)) {
                    return match;
                }
                // Otherwise quote it and escape quotes
                const safeTitle = trimmedTitle.replace(/"/g, "'");
                return `subgraph "${safeTitle}"`;
            });

        // Fix 4: Remove standalone semicolons that might be left over
        fixedChart = fixedChart.replace(/;\s*$/gm, '');

        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`
        const { svg } = await mermaid.render(id, fixedChart)
        setSvgContent(svg)
        setError(null)
      } catch (err: any) {
        console.error("Mermaid render error:", err)
        setError(err.message || "Failed to render diagram")
      }
    }

    renderChart()
  }, [chart])

  const handleDownload = () => {
    if (!svgContent) return
    const blob = new Blob([svgContent], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "diagram.svg"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (error) {
    return (
      <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10 text-destructive text-sm">
        {error}
        <pre className="mt-2 text-xs opacity-70 overflow-x-auto">{chart}</pre>
      </div>
    )
  }

  return (
    <div className="my-4 rounded-lg border border-border bg-card shadow-sm overflow-hidden relative group">
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => setScale(s => Math.min(s + 0.2, 2))}>
            <ZoomIn size={14} />
        </Button>
        <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => setScale(s => Math.max(s - 0.2, 0.5))}>
            <ZoomOut size={14} />
        </Button>
        <Button variant="secondary" size="icon" className="h-8 w-8" onClick={handleDownload}>
            <Download size={14} />
        </Button>
      </div>
      
      <div className="overflow-auto p-4 flex justify-center bg-muted/20 min-h-[200px]">
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: scale }}
            transition={{ duration: 0.3 }}
            dangerouslySetInnerHTML={{ __html: svgContent }} 
            className="origin-center"
        />
      </div>
    </div>
  )
}
