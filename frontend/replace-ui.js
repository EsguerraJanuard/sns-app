const fs = require('fs');
let code = fs.readFileSync('src/app/transaction/new/TransactionForm.tsx', 'utf8');

const oldStart = "{exchangeWalletId && exchangeWalletId === wallets.find(w => w.slug === 'cash')?.id && (";
const oldEnd = "{(exchangeWalletId || isCustomerDebt) && (";

const startIndex = code.indexOf(oldStart);
const endIndex = code.indexOf(oldEnd);

if (startIndex > -1 && endIndex > -1) {
  const newUi = `
          {/* Lenders / Funding Debt Section */}
          <div className="mt-8 border-2 border-red-100 rounded-[2rem] overflow-hidden bg-white shadow-sm">
            <div className="p-5 flex items-center justify-between bg-red-50/50">
              <span className="font-bold text-lg text-red-900 tracking-tight flex items-center gap-2">
                <span className="text-2xl text-red-400">+</span>
                Add Lenders (Pampuno)
              </span>
              <button 
                type="button"
                onClick={() => setFundingDebts([...fundingDebts, { id: Math.random().toString(), contactName: '', amount: '' }])}
                className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2.5 rounded-xl active:scale-95 transition-all shadow-sm"
              >
                + Add Lender
              </button>
            </div>

            {fundingDebts.length > 0 && (
              <div className="p-5 space-y-4">
                {fundingDebts.map((fd, index) => (
                  <div key={fd.id} className="p-4 bg-red-50/50 rounded-2xl border border-red-100 relative shadow-sm">
                    <button 
                      type="button"
                      onClick={() => {
                        const newDebts = [...fundingDebts];
                        newDebts.splice(index, 1);
                        setFundingDebts(newDebts);
                      }}
                      className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors"
                    >
                      <XCircle size={24} />
                    </button>
                    
                    <div className="space-y-4 pr-8">
                      <div>
                        <label className="block text-xs font-black text-red-700/60 uppercase tracking-widest mb-1.5">Kanino inutang?</label>
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
                        <label className="block text-xs font-black text-red-700/60 uppercase tracking-widest mb-1.5">Magkano?</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-red-300">₱</span>
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
                            className="w-full bg-white border border-red-200 rounded-xl py-3 pl-10 pr-4 text-xl font-black text-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 placeholder:text-red-200"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Subtotal of Borrowed */}
                <div className="bg-red-100/40 p-4 rounded-xl flex flex-col gap-2 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-red-800">Total Borrowed:</span>
                    <span className="font-black text-xl text-red-700">₱{totalFundingDebt.toLocaleString()}</span>
                  </div>
                  {direction === 'IN' && rawAmount > 0 && (
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
  
  code = code.substring(0, startIndex) + newUi + code.substring(endIndex);
  fs.writeFileSync('src/app/transaction/new/TransactionForm.tsx', code);
  console.log('UI Block REPLACED SUCCESSFULLY');
} else {
  console.log('Could not find startIndex or endIndex:', startIndex, endIndex);
}
