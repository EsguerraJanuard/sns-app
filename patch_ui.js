const fs = require('fs');
let code = fs.readFileSync('frontend/src/app/transaction/new/TransactionForm.tsx', 'utf8');

// Replace "NO DEDUCTION" with "NO CHARGE"
code = code.replace(/'NO DEDUCTION'/g, "'NO CHARGE'");

// Find the section for the isBorrowed checkbox and remove it.
const checkboxSection = `{direction === 'IN' && (
          <section>
            <label className={\`
              flex items-center gap-4 p-6 rounded-3xl border-2 cursor-pointer transition-colors shadow-sm mt-4
              \${isBorrowed ? 'bg-red-50 border-red-200' : 'bg-white border-zinc-100 hover:bg-zinc-50'}
            \`}>
              <div className="flex-1 min-w-0">
                <p className={\`text-xl sm:text-2xl font-black truncate \${isBorrowed ? 'text-red-700' : 'text-zinc-700'}\`}>Borrowed</p>
                <p className={\`text-base font-medium \${isBorrowed ? 'text-red-600/70' : 'text-zinc-400'}\`}>Check if this money is borrowed</p>
              </div>
              <input 
                type="checkbox" 
                checked={isBorrowed}
                onChange={(e) => {
                  setIsBorrowed(e.target.checked)
                  if (e.target.checked) setExchangeWalletId('')
                }}
                className="w-8 h-8 rounded-lg border-zinc-300 text-red-600 focus:ring-red-500 bg-white shadow-sm"
              />
            </label>
          </section>
        )}`;

if (code.includes(checkboxSection)) {
  code = code.replace(checkboxSection, '');
  console.log('Successfully removed the isBorrowed checkbox section.');
} else {
  console.log('Warning: Could not find the exact string to remove the checkbox.');
}

fs.writeFileSync('frontend/src/app/transaction/new/TransactionForm.tsx', code);
