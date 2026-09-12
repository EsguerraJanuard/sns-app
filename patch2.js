const fs = require('fs');
let code = fs.readFileSync('frontend/src/app/transaction/new/TransactionForm.tsx', 'utf8');

// Replace NO DEDUCTION
code = code.replace(/'NO DEDUCTION'/g, "'NO CHARGE'");

// Remove the section
const lines = code.split('\n');
const startIndex = lines.findIndex(l => l.includes("direction === 'IN' && ("));
if (startIndex !== -1) {
    let endIndex = startIndex;
    for (let i = startIndex + 1; i < lines.length; i++) {
        if (lines[i].includes(")}")) {
            endIndex = i;
            break;
        }
    }
    // ensure we got the right block
    const block = lines.slice(startIndex, endIndex + 1).join('\n');
    if (block.includes('Borrowed')) {
        lines.splice(startIndex, endIndex - startIndex + 1);
        console.log('Removed block.');
    } else {
        console.log('Block did not match expected structure.');
    }
} else {
    console.log('Could not find start index.');
}
fs.writeFileSync('frontend/src/app/transaction/new/TransactionForm.tsx', lines.join('\n'));
