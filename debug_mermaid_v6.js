
const mermaid = {
    parse: (text) => {
        // Mock parse to check regex transformations
        console.log("--- Parsing ---");
        console.log(text);
        return true;
    }
};

const chart = `graph TD
    subgraph Game Loop %% Comment
        A[Input] --> B[Update]
    end
    subgraph "Valid Quoted"
        C[Render]
    end
    subgraph A [Title with Brackets]
        D[Node]
    end
    subgraph B direction TB
        E[Node]
    end
    F[Click "Start" Button]
    G[Array [1, 2]]
    H[Nested {Curly} Braces]
`;

console.log("--- Original ---");
console.log(chart);

// Helper to quote content safely
const quoteContent = (content) => {
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
    
    // Fix 2: Specific Bracket Matching
    // Note: This simple regex only matches innermost brackets
    .replace(/\[([^\[\]]+)\]/g, (match, content) => {
        console.log(`Match []: ${match} -> [${quoteContent(content)}]`);
        return `[${quoteContent(content)}]`;
    })
    .replace(/\{([^{}]+)\}/g, (match, content) => {
        console.log(`Match {}: ${match} -> {${quoteContent(content)}}`);
        return `{${quoteContent(content)}}`;
    })
    .replace(/\(([^()]+)\)/g, (match, content) => {
        console.log(`Match (): ${match} -> (${quoteContent(content)})`);
        return `(${quoteContent(content)})`;
    })
    
    // Fix 3: Quote subgraph titles
    .replace(/subgraph\s+([^\r\n;]+)/g, (match, title) => {
        const trimmedTitle = title.trim();
        console.log(`Match subgraph: '${title}'`);
        
        if (/^["'].*["']$/.test(trimmedTitle) || /^[a-zA-Z0-9_]+$/.test(trimmedTitle)) {
            return match;
        }
        
        // If it looks like "id [Title]", don't quote the whole thing!
        if (trimmedTitle.match(/^[a-zA-Z0-9_]+\s*\[.*\]$/)) {
             console.log("  -> Looks like id [Title], skipping quote");
             return match;
        }

        // If it has direction, split it?
        // Naive check: if it ends with "direction TB/BT/RL/LR", don't quote that part?
        // Too complex.
        
        // Escape quotes in title
        const safeTitle = trimmedTitle.replace(/"/g, "'");
        return `subgraph "${safeTitle}"`;
    });

fixedChart = fixedChart.replace(/;\s*$/gm, '');

console.log("\n--- Fixed ---");
console.log(fixedChart);
