const fs = require('fs');
let code = fs.readFileSync('src/app/transactions/page.tsx', 'utf8');

const target = "{tx.kind === 'BORROWED' && (\n                            <>";

const replacement = `{tx.fundingCount > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-orange-500 font-black">{tx.fundingCount} Pampuno</span>
                            </>
                          )}
                          {tx.kind === 'BORROWED' && (
                            <>`;

code = code.replace(target, replacement);
fs.writeFileSync('src/app/transactions/page.tsx', code);
console.log('Added badge to transactions/page.tsx');
