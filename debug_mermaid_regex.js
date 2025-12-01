
const chart = `graph TD
    User((User)) --> C{Detect Intent: "Creative Output"};
    C -->|Creative| D[Creative Engine];
    E{ "Key": "Value" }
    F{Mixed: "Content"};
`;

console.log("--- Original ---");
console.log(chart);

// Fix 1: Trailing semicolons
let step1 = chart.replace(/([\]\}\)])\s*;/g, '$1');
console.log("\n--- Step 1 (Semicolons) ---");
console.log(step1);

// Fix 2: Quotes
let step2 = step1.replace(/([\[\{\(])\s*([^\]\}\)]*:[^\]\}\)]*)\s*([\]\}\)])/g, (match, open, content, close) => {
    console.log(`\nMatch found: '${match}'`);
    console.log(`Content: '${content}'`);
    
    // If content is already fully quoted (starts and ends with same quote), don't touch
    if ((content.startsWith('"') && content.endsWith('"')) || 
        (content.startsWith("'") && content.endsWith("'"))) {
        console.log("-> Skipped (already quoted)");
        return match;
    }
    // Otherwise, quote it and escape internal quotes
    const safeContent = content.replace(/"/g, "'");
    console.log(`-> Fixed: ${open}"${safeContent}"${close}`);
    return `${open}"${safeContent}"${close}`;
});

console.log("\n--- Step 2 (Quotes) ---");
console.log(step2);

// Fix 3: Standalone semicolons
let step3 = step2.replace(/;\s*$/gm, '');
console.log("\n--- Step 3 (Cleanup) ---");
console.log(step3);
