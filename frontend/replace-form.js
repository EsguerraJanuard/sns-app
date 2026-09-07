const fs = require('fs');
let code = fs.readFileSync('src/app/transaction/new/TransactionForm.tsx', 'utf8');

// Replace state
code = code.replace(
  /const \[fundingDebtAmount, setFundingDebtAmount\] = useState\(''\)[\s\S]*?const \[showFundingSuggestions, setShowFundingSuggestions\] = useState\(false\)/m,
  'const [fundingDebts, setFundingDebts] = useState<{ id: string, contactName: string, amount: string }[]>([])'
);

// Replace derived values
code = code.replace(
  /const rawFundingDebt = Number\(fundingDebtAmount\.replace\(\/,\/g, ''\) \|\| 0\);/m,
  "const totalFundingDebt = fundingDebts.reduce((acc, curr) => acc + Number(curr.amount.replace(/,/g, '') || 0), 0);"
);

code = code.replace(
  /const projectedBalance = deductedWalletBalance \+ \(showFundingDebt \? rawFundingDebt : 0\) - deductedAmount;/m,
  'const projectedBalance = deductedWalletBalance + totalFundingDebt - deductedAmount;'
);

// Replace validate block
code = code.replace(
  /if \(showFundingDebt\) \{[\s\S]*?\}/m,
  `if (fundingDebts.length > 0) {
      let fundingError = false;
      fundingDebts.forEach(fd => {
        const amt = Number(fd.amount.replace(/,/g, ''));
        if (!amt || amt <= 0 || !fd.contactName.trim()) {
          fundingError = true;
        }
      });
      if (fundingError) newErrors.push("Pakikumpleto ang pangalan at tamang halaga para sa mga inutang pampuno.");
      
      const mainAmount = Number(amount.replace(/,/g, ''));
      if (totalFundingDebt > mainAmount && direction === 'IN') {
        newErrors.push("Ang kabuuang inutang ay hindi pwedeng mas malaki sa ipinasok na amount.");
      }
    }`
);

// Replace payload
code = code.replace(
  /funding_debt_amount: showFundingDebt \? Number\(fundingDebtAmount\.replace\(\/,\/g, ''\)\) : undefined,\s*funding_debt_contact: showFundingDebt \? fundingDebtContact : undefined/m,
  "funding_debts: fundingDebts.length > 0 ? fundingDebts.map(fd => ({ contact_name: fd.contactName, amount: Number(fd.amount.replace(/,/g, '')) })) : undefined"
);

// Replace UI section
const uiNew = `
          {/* Lenders / Funding Debt Section */}
          <div className="pt-6 border-t-2 border-zinc-100 border-dashed">
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-lg text-zinc-800">
                Lenders (Inutang / Pampuno)
              </span>
              <button 
                type="button"
                onClick={() => setFundingDebts([...fundingDebts, { id: Math.random().toString(), contactName: '', amount: '' }])}
                className="bg-red-50 text-red-600 font-bold px-4 py-2 rounded-xl active:scale-95 transition-transform"
              >
                + Add Lender
              </button>
            </div>

            {fundingDebts.length > 0 && (
              <div className="space-y-4">
                {fundingDebts.map((fd, index) => (
                  <div key={fd.id} className="p-4 bg-red-50 rounded-2xl border border-red-100 relative">
                    <button 
                      type="button"
                      onClick={() => {
                        const newDebts = [...fundingDebts];
                        newDebts.splice(index, 1);
                        setFundingDebts(newDebts);
                      }}
                      className="absolute top-4 right-4 text-red-400 hover:text-red-600"
                    >
                      <XCircle size={24} />
                    </button>
                    
                    <div className="space-y-4 pr-8">
                      <div>
                        <label className="block text-sm font-bold text-red-700 uppercase tracking-widest mb-1">Kanino inutang?</label>
                        <input 
                          type="text"
                          value={fd.contactName}
                          onChange={(e) => {
                            const newDebts = [...fundingDebts];
                            newDebts[index].contactName = e.target.value;
                            setFundingDebts(newDebts);
                          }}
                          placeholder="Pangalan..."
                          className="w-full bg-white border border-red-200 rounded-xl p-3 text-lg font-bold text-red-900 focus:outline-none focus:ring-2 focus:ring-red-400 placeholder:text-red-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-red-700 uppercase tracking-widest mb-1">Magkano?</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-red-700">₱</span>
                          <input 
                            type="text" 
                            inputMode="decimal"
                            value={fd.amount}
                            onChange={(e) => {
                              let raw = e.target.value.replace(/[^0-9.]/g, '')
                              const parts = raw.split('.')
                              if (parts.length > 2) raw = parts[0] + '.' + parts.slice(1).join('')
                              if (parts[1] && parts[1].length > 2) raw = parts[0] + '.' + parts[1].slice(0, 2)
                              
                              if (raw) {
                                const p = raw.split('.')
                                p[0] = p[0].replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',')
                                raw = p.join('.')
                              }
                              
                              const newDebts = [...fundingDebts];
                              newDebts[index].amount = raw;
                              setFundingDebts(newDebts);
                            }}
                            className="w-full bg-white border border-red-200 rounded-xl py-3 pl-8 pr-3 text-xl font-black text-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 placeholder:text-red-300"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Subtotal of Borrowed */}
                <div className="bg-red-100/50 p-4 rounded-xl border border-red-200 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-red-800">Total Borrowed:</span>
                    <span className="font-black text-xl text-red-700">₱{totalFundingDebt.toLocaleString()}</span>
                  </div>
                  {direction === 'IN' && (
                    <div className="flex justify-between items-center pt-2 border-t border-red-200/50">
                      <span className="font-bold text-zinc-600">Your Own Money (Net):</span>
                      <span className="font-black text-lg text-zinc-900">₱{Math.max(0, rawAmount - totalFundingDebt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
`;

// Replace UI Block
const uiStartIndex = code.indexOf('{/* Funding Debt Checkbox */}');
if (uiStartIndex > -1) {
  let uiEndIndex = code.indexOf('{/* Final Summary Before Saving */}');
  if (uiEndIndex === -1) uiEndIndex = code.indexOf('<div className="mt-8">');
  
  if (uiEndIndex > -1) {
    code = code.substring(0, uiStartIndex) + uiNew + '\n\n' + code.substring(uiEndIndex);
  }
}

// Remove the unused contact fetch functions
code = code.replace(/const handleFundingContactChange =[\s\S]*?fundingContactRef\.current\?\.blur\(\)\s*\}\s*/m, '');

fs.writeFileSync('src/app/transaction/new/TransactionForm.tsx', code);
console.log('Done replacing TransactionForm');
