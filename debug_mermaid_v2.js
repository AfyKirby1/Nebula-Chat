
const chart = `graph TD
    A[Call: func()] --> B{Detect Intent: "Creative Output"}
    C((Circle: Text)) --> D(Round: Text)
    E{ "Key": "Value" }
    F[ "Array: [1, 2]" ]
    G[ "Multiline
    String" ]
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
    // Only quote if it contains a colon (simple heuristic)
    if (!content.includes(':')) return content;
    
    const safeContent = content.replace(/"/g, "'");
    return `"${safeContent}"`;
};

let fixedChart = chart
    // Fix 1: Trailing semicolons
    .replace(/([\]\}\)])\s*;/g, '$1')
    
    // Fix 2: Specific Bracket Matching
    // Square Brackets [ ... ]
    .replace(/\[([^\[\]]+)\]/g, (match, content) => {
        return `[${quoteContent(content)}]`;
    })
    // Curly Braces { ... }
    .replace(/\{([^{}]+)\}/g, (match, content) => {
        return `{${quoteContent(content)}}`;
    })
    // Parentheses ( ... ) - Be careful with ((...))
    .replace(/\(([^()]+)\)/g, (match, content) => {
        return `(${quoteContent(content)})`;
    });

console.log("\n--- Fixed ---");
console.log(fixedChart);
