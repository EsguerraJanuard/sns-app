'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowDownRight, ArrowUpRight, Search, CheckCircle2, Wallet as WalletIcon, ChevronLeft, Car, Smartphone, Landmark, AlertCircle, AlertTriangle } from 'lucide-react'
import { Wallet } from '@/actions/wallet'
import { searchContacts } from '@/actions/contact'
import { createTransaction } from '@/actions/transaction'

const getWalletBrand = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('maya')) return { icon: WalletIcon, color: 'text-green-600', border: 'border-green-200', bg: 'bg-green-50', solidBg: 'bg-green-600', shadow: 'shadow-green-600/30' };
  if (lower.includes('gcash')) return { icon: WalletIcon, color: 'text-blue-500', border: 'border-blue-200', bg: 'bg-blue-50', solidBg: 'bg-blue-600', shadow: 'shadow-blue-600/30' };
  if (lower.includes('maribank')) return { icon: Landmark, color: 'text-orange-500', border: 'border-orange-200', bg: 'bg-orange-50', solidBg: 'bg-orange-500', shadow: 'shadow-orange-500/30' };
  if (lower.includes('auto-supply')) return { icon: Car, color: 'text-zinc-700', border: 'border-zinc-300', bg: 'bg-zinc-200', solidBg: 'bg-zinc-800', shadow: 'shadow-zinc-800/30' };
  if (lower.includes('load')) return { icon: Smartphone, color: 'text-purple-600', border: 'border-purple-200', bg: 'bg-purple-50', solidBg: 'bg-purple-600', shadow: 'shadow-purple-600/30' };
  return { icon: WalletIcon, color: 'text-zinc-500', border: 'border-zinc-200', bg: 'bg-zinc-100', solidBg: 'bg-[#4A4A4A]', shadow: 'shadow-[#4A4A4A]/30' };
};

export default function TransactionForm({ wallets }: { wallets: Wallet[] }) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  
  const [direction, setDirection] = useState<'IN' | 'OUT' | null>(null)
  const [contactName, setContactName] = useState('')
  const [contactSuggestions, setContactSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [amount, setAmount] = useState('')
  const [walletId, setWalletId] = useState<string>('')
  
  const [isBorrowed, setIsBorrowed] = useState(false) // For IN
  const [isCustomerDebt, setIsCustomerDebt] = useState(false) // For OUT
  const [isExpense, setIsExpense] = useState(false) // For OUT
  
  const defaultExchangeId = wallets.find(w => w.slug === 'cash')?.id || ''
  const [exchangeWalletId, setExchangeWalletId] = useState<string>(defaultExchangeId)
  const [exchangeFee, setExchangeFee] = useState<string>('')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const [errors, setErrors] = useState<string[]>([])
  const [confirmChecked, setConfirmChecked] = useState(false)

  // Refs for auto-focus navigation
  const amountRef = useRef<HTMLInputElement>(null)
  const contactRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Auto-focus amount input on mount
    amountRef.current?.focus()
  }, [])

  const handleAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      contactRef.current?.focus()
    }
  }

  const handleContactKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.currentTarget.blur()
    }
  }

  const handleContactSearch = async (val: string) => {
    setContactName(val)
    if (val.trim().length > 0) {
      const results = await searchContacts(val)
      setContactSuggestions(results)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  const selectContact = (name: string) => {
    setContactName(name)
    setShowSuggestions(false)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^0-9.]/g, '')
    const parts = raw.split('.')
    if (parts.length > 2) raw = parts[0] + '.' + parts.slice(1).join('')
    if (parts[1] && parts[1].length > 2) raw = `${parts[0]}.${parts[1].slice(0, 2)}`
    
    if (raw) {
      const numAmount = Number(raw)
      const computedFee = Math.ceil(numAmount / 1000) * 10
      setExchangeFee(computedFee.toString())

      const p = raw.split('.')
      p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      setAmount(p.join('.'))
    } else {
      setAmount('')
      setExchangeFee('')
    }
  }

  const handleNextClick = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors = []
    if (!amount) newErrors.push("Ilagay kung Magkano")
    if (!direction) newErrors.push("Piliin kung Pumasok o Lumabas")
    if (!walletId) newErrors.push("Piliin kung Saan (Wallet)")
    if (isCustomerDebt && !contactName) newErrors.push("Kailangan ang pangalan kapag Inutang ng Customer")
    if (isBorrowed && !contactName) newErrors.push("Kailangan ang pangalan kapag Nangutang ka")
    
    if (newErrors.length > 0) {
      setErrors(newErrors)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setErrors([])
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const executeSubmit = async () => {
    if (!confirmChecked) return
    setIsSubmitting(true)
    
    let kind: 'REGULAR' | 'BORROWED' | 'LENT' | 'EXPENSE' = 'REGULAR'
    if (direction === 'IN' && isBorrowed) kind = 'BORROWED'
    if (direction === 'OUT' && isCustomerDebt) kind = 'LENT'
    if (direction === 'OUT' && isExpense) kind = 'EXPENSE'

    try {
      await createTransaction({
        direction: direction!,
        contact_name: contactName || undefined,
        amount: Number(amount.replace(/,/g, '')),
        wallet_id: walletId,
        kind: kind as any,
        exchange_wallet_id: exchangeWalletId || undefined,
        exchange_fee: exchangeFee ? Number(exchangeFee) : 0
      })
      
      setIsSuccess(true)
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } catch (error) {
      console.error(error)
      alert("We couldn't save this transaction. Please try again.")
      setIsSubmitting(false)
    }
  }

  const selectedWalletName = wallets.find(w => w.id === walletId)?.name
  const activeBrand = selectedWalletName 
    ? getWalletBrand(selectedWalletName) 
    : { solidBg: 'bg-[#4A4A4A]', shadow: 'shadow-[#4A4A4A]/30', bg: 'bg-zinc-100', color: 'text-zinc-500' }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <CheckCircle2 size={96} className="text-green-500" strokeWidth={2.5} />
        <h2 className="text-3xl font-black text-zinc-900">Na-save na!</h2>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-50 relative pb-32">
        <header className={`${direction === 'IN' ? 'bg-green-500' : 'bg-blue-500'} text-white px-5 pt-8 pb-14 shadow-sm rounded-b-[2.5rem] relative z-20`}>
          <div className="flex items-center mb-8">
            <button onClick={() => setStep(1)} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
              <ChevronLeft size={32} />
            </button>
            <h1 className="text-xl font-bold ml-2">Review Transaction</h1>
          </div>
          <div className="text-center px-2">
            <h2 className="text-white/80 text-sm font-bold uppercase tracking-widest mb-1">Check details before saving</h2>
            <div className="text-5xl sm:text-6xl font-black tracking-tight text-white drop-shadow-sm truncate">
              {direction === 'IN' ? '+' : '-'}₱{amount}
            </div>
          </div>
        </header>

        <div className="px-5 -mt-8 relative z-30 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100 space-y-5">
            <div className="flex justify-between items-center border-b border-zinc-50 pb-4">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Type</span>
              <span className="text-xl font-black text-zinc-900">
                {direction === 'IN' ? 'Money IN' : 'Money OUT'}
                {isBorrowed && ' (Borrowed)'}
                {isCustomerDebt && ' (Customer Debt)'}
                {isExpense && ' (Expense)'}
              </span>
            </div>
            
            <div className="flex justify-between items-center border-b border-zinc-50 pb-4">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Wallet</span>
              <span className={`text-xl font-black ${activeBrand.color} bg-opacity-10 px-3 py-1 rounded-xl`}>
                {selectedWalletName}
              </span>
            </div>

            <div className={`flex justify-between items-center ${exchangeWalletId ? 'border-b border-zinc-50 pb-4' : ''}`}>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Contact</span>
              <span className="text-xl font-black text-zinc-900 break-words text-right max-w-[60%]">
                {contactName || 'None'}
              </span>
            </div>

            {exchangeWalletId && (
              <div className="pt-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-3">Exchange Breakdown</span>
                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 space-y-2">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-zinc-500">Base Amount</span>
                    <span className="text-zinc-900">₱{amount}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-zinc-500">Convenience Fee</span>
                    <span className="text-zinc-900">₱{exchangeFee || 0}</span>
                  </div>
                  <div className="h-px bg-zinc-200 my-2" />
                  
                  {direction === 'OUT' ? (
                    <>
                      <div className="flex justify-between items-center text-sm font-bold text-red-600">
                        <span>Total Deducted ({selectedWalletName})</span>
                        <span>-₱{amount}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-black text-green-600">
                        <span>Total Added ({wallets.find(w => w.id === exchangeWalletId)?.name})</span>
                        <span>+₱{Number(amount.replace(/,/g, '') || 0) + Number(exchangeFee || 0)}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center text-sm font-black text-green-600">
                        <span>Total Added ({selectedWalletName})</span>
                        <span>+₱{amount}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-bold text-red-600">
                        <span>Total Deducted ({wallets.find(w => w.id === exchangeWalletId)?.name})</span>
                        <span>-₱{Number(amount.replace(/,/g, '') || 0) - Number(exchangeFee || 0)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <label className={`
            flex items-start gap-4 p-6 rounded-3xl border-2 cursor-pointer transition-colors shadow-sm
            ${confirmChecked ? 'bg-blue-50 border-blue-500' : 'bg-white border-zinc-200'}
          `}>
            <input 
              type="checkbox" 
              checked={confirmChecked}
              onChange={(e) => setConfirmChecked(e.target.checked)}
              className="mt-1 w-7 h-7 rounded-lg border-zinc-300 text-blue-600 focus:ring-blue-500 bg-white" 
            />
            <span className={`text-lg font-bold ${confirmChecked ? 'text-blue-900' : 'text-zinc-600'}`}>
              I confirm that the above details are correct.
            </span>
          </label>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-zinc-100 pb-safe z-40">
          <div className="max-w-[400px] mx-auto">
            <button
              onClick={executeSubmit}
              disabled={!confirmChecked || isSubmitting}
              className={`w-full ${confirmChecked ? 'bg-zinc-900' : 'bg-zinc-200'} text-white rounded-[1.5rem] py-5 text-xl font-black uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center gap-2`}
            >
              {isSubmitting ? 'Saving...' : 'Confirm & Save'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // STEP 1
  return (
    <form onSubmit={handleNextClick} className="flex flex-col min-h-screen relative">
      <header className={`${activeBrand.solidBg} text-white px-5 pt-8 pb-10 shadow-md rounded-b-[2rem] relative z-10 transition-colors duration-300`}>
        <div className="flex items-center mb-6">
          <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <ChevronLeft size={28} />
          </Link>
          <h1 className="text-xl font-bold ml-2">New Transaction</h1>
        </div>
        
        <div className="text-center mt-2">
          <label className="text-white/80 text-sm font-bold uppercase tracking-widest block mb-1">Magkano?</label>
          <div className="flex items-center justify-center gap-1">
            <span className={`text-5xl font-bold ${amount ? 'text-white' : 'text-white/40'}`}>₱</span>
            <input 
              ref={amountRef}
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={handleAmountChange}
              onKeyDown={handleAmountKeyDown}
              enterKeyHint="next"
              placeholder="0.00"
              className="w-full max-w-[220px] text-6xl font-black bg-transparent text-white focus:outline-none placeholder:text-white/40"
            />
          </div>
        </div>
      </header>

      <div className="px-5 py-6 space-y-6 flex-1 -mt-4 bg-zinc-50 relative z-0 pb-32">
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-red-600 font-bold mb-2">
              <AlertTriangle size={20} />
              <p>Kulangan pa:</p>
            </div>
            <ul className="list-disc pl-5 text-red-600 text-sm font-semibold">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <section className="bg-white p-1.5 rounded-3xl flex gap-1 shadow-sm border border-zinc-100">
          <button
            type="button"
            onClick={() => {
              setDirection('IN')
              setIsCustomerDebt(false)
              setIsExpense(false)
            }}
            className={`flex-1 py-4 rounded-[1.25rem] flex items-center justify-center gap-2 font-bold transition-all ${
              direction === 'IN' 
                ? 'bg-green-100 text-green-700 shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            <ArrowDownRight size={22} strokeWidth={3} />
            Pumasok
          </button>
          <button
            type="button"
            onClick={() => {
              setDirection('OUT')
              setIsBorrowed(false)
            }}
            className={`flex-1 py-4 rounded-[1.25rem] flex items-center justify-center gap-2 font-bold transition-all ${
              direction === 'OUT' 
                ? 'bg-blue-100 text-blue-700 shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            <ArrowUpRight size={22} strokeWidth={3} />
            Lumabas
          </button>
        </section>

        <section className="space-y-2 relative">
          <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider block px-1">
            Kanino? <span className="font-normal normal-case ml-1 text-xs">(Optional)</span>
          </label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
            <input 
              ref={contactRef}
              type="text" 
              value={contactName}
              onChange={(e) => handleContactSearch(e.target.value)}
              onKeyDown={handleContactKeyDown}
              onFocus={() => {
                if (!contactName) handleContactSearch('') 
              }}
              enterKeyHint="done"
              placeholder="Pangalan (e.g. Maria, Load, Supplier)"
              className={`w-full pl-12 pr-4 py-4 text-lg font-bold rounded-2xl bg-white border shadow-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:font-medium placeholder:text-zinc-300 ${errors.some(e => e.includes('pangalan')) ? 'border-red-400 ring-2 ring-red-100' : 'border-zinc-100'}`}
            />
          </div>
          
          {showSuggestions && contactSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-zinc-100 rounded-2xl shadow-xl shadow-zinc-200/50 z-20 overflow-hidden">
              {contactSuggestions.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => selectContact(c.name)}
                  className="w-full text-left px-5 py-4 text-lg font-bold text-zinc-700 hover:bg-zinc-50 border-b border-zinc-50 last:border-0"
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-2">
          <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider block px-1">Saan?</label>
          <div className="grid grid-cols-2 gap-2">
            {wallets.map((w, index) => {
              const isLastOdd = index === wallets.length - 1 && wallets.length % 2 !== 0;
              const Brand = getWalletBrand(w.name);
              const Icon = Brand.icon;
              const isSelected = walletId === w.id;
              return (
                <label 
                  key={w.id} 
                  className={`
                    relative flex items-center justify-center p-4 rounded-2xl cursor-pointer transition-all border
                    ${isSelected ? `bg-white ${Brand.border} ${Brand.shadow} shadow-md` : 'bg-white border-zinc-100 hover:bg-zinc-50 hover:border-zinc-200'}
                    ${isLastOdd ? 'col-span-2' : ''}
                  `}
                >
                  <input
                    type="radio"
                    name="wallet"
                    value={w.id}
                    checked={isSelected}
                    onChange={(e) => {
                      const newWalletId = e.target.value;
                      setWalletId(newWalletId);
                      if (exchangeWalletId === newWalletId) {
                        setExchangeWalletId(''); // Prevent transferring to the same wallet
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? Brand.solidBg : Brand.bg} ${isSelected ? 'text-white' : Brand.color} transition-colors`}>
                      <Icon size={20} strokeWidth={2.5} />
                    </div>
                    <span className={`text-base uppercase tracking-widest transition-colors ${isSelected ? `font-black ${Brand.color}` : 'font-bold text-zinc-400'}`}>
                      {w.name}
                    </span>
                  </div>
                </label>
              )
            })}
          </div>
        </section>

        {/* EXCHANGE / KAPALIT WALLET */}
        <section className="space-y-2 mt-6">
          <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider block px-1">
            Patutunguhan / Destination
          </label>
          <div className="grid grid-cols-2 gap-2">
            
            <label className={`
              col-span-2 flex items-center justify-center p-4 rounded-2xl cursor-pointer transition-all border
              ${!exchangeWalletId ? 'bg-zinc-800 text-white border-zinc-800 font-bold shadow-md' : 'bg-white border-zinc-100 text-zinc-400 hover:bg-zinc-50 hover:border-zinc-200'}
            `}>
              <input type="radio" name="exchangeWallet" value="" checked={!exchangeWalletId} onChange={() => setExchangeWalletId('')} className="sr-only" />
              <span className="text-base font-black uppercase tracking-widest leading-tight">Walang Kapalit</span>
            </label>
            
            {wallets.map((w, index) => {
              if (w.id === walletId) return null;
              
              // We need to recalculate odd/even based on filtered list to apply col-span-2 if needed
              const filteredWallets = wallets.filter(fw => fw.id !== walletId);
              const isLastOdd = index === wallets.length - 1 && filteredWallets.length % 2 !== 0;
              
              const Brand = getWalletBrand(w.name);
              const isSelected = exchangeWalletId === w.id;
              
              return (
                <label key={w.id} className={`
                  relative flex items-center justify-center p-4 rounded-2xl cursor-pointer transition-all border
                  ${isSelected ? `bg-white ${Brand.border} ${Brand.shadow} shadow-md` : 'bg-white border-zinc-100 hover:bg-zinc-50 hover:border-zinc-200'}
                  ${isLastOdd ? 'col-span-2' : ''}
                `}>
                  <input type="radio" name="exchangeWallet" value={w.id} checked={isSelected} onChange={() => setExchangeWalletId(w.id)} className="sr-only" />
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? Brand.solidBg : Brand.bg} ${isSelected ? 'text-white' : Brand.color} transition-colors`}>
                      <Brand.icon size={20} strokeWidth={2.5} />
                    </div>
                    <span className={`text-base uppercase tracking-widest transition-colors ${isSelected ? `font-black ${Brand.color}` : 'font-bold text-zinc-400'}`}>{w.name}</span>
                  </div>
                </label>
              )
            })}
          </div>
          
          {exchangeWalletId && (
            <div className="mt-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-4">
                
                {/* Quick Fee Buttons */}
                <div>
                  <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Quick Fee (Discount)</div>
                  <div className="flex flex-wrap gap-2">
                    {[0, 5, 10, 15, 20, 25, 30].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setExchangeFee(val.toString())}
                        className={`px-3 py-1.5 rounded-xl text-sm font-black transition-all border-2 active:scale-95 ${exchangeFee === val.toString() ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300'}`}
                      >
                        ₱{val}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">Fee: ₱</span>
                  <input 
                    type="number"
                    value={exchangeFee}
                    onChange={(e) => setExchangeFee(e.target.value)}
                    className="w-full bg-white rounded-xl border-2 border-zinc-200 px-4 py-3 text-2xl font-black text-zinc-900 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="0"
                  />
                </div>
                
                <div className="text-xs font-bold text-zinc-500 space-y-1.5 bg-white p-3 rounded-xl border border-zinc-100 shadow-sm">
                  {direction === 'OUT' ? (
                    <>
                      <div className="flex justify-between text-red-500"><span>Mula sa {selectedWalletName || 'E-Wallet'}</span> <span>- ₱{amount || 0}</span></div>
                      <div className="flex justify-between text-green-600 font-black"><span>Papasok sa {wallets.find(w => w.id === exchangeWalletId)?.name}</span> <span>+ ₱{Number(amount.replace(/,/g, '') || 0) + Number(exchangeFee || 0)}</span></div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-green-600 font-black"><span>Papasok sa {selectedWalletName || 'E-Wallet'}</span> <span>+ ₱{amount || 0}</span></div>
                      <div className="flex justify-between text-red-500"><span>Mula sa {wallets.find(w => w.id === exchangeWalletId)?.name}</span> <span>- ₱{Number(amount.replace(/,/g, '') || 0) - Number(exchangeFee || 0)}</span></div>
                    </>
                  )}
                </div>
              </div>
            )}
        </section>

        {direction === 'IN' && (
          <section>
            <label className={`
              flex items-center gap-4 p-5 rounded-2xl border cursor-pointer transition-colors
              ${isBorrowed ? 'bg-red-50 border-red-200' : 'bg-white border-zinc-100 hover:bg-zinc-50'}
            `}>
              <div className="flex-1 min-w-0">
                <p className={`text-lg font-black truncate ${isBorrowed ? 'text-red-700' : 'text-zinc-700'}`}>Inutang ko 'to</p>
                <p className={`text-sm font-medium ${isBorrowed ? 'text-red-600/70' : 'text-zinc-400'}`}>Check mo kung galing sa utang yung pera</p>
              </div>
              <input 
                type="checkbox" 
                checked={isBorrowed}
                onChange={(e) => setIsBorrowed(e.target.checked)}
                className="w-7 h-7 rounded-lg border-zinc-300 text-red-600 focus:ring-red-500 bg-white"
              />
            </label>
          </section>
        )}

        {direction === 'OUT' && (
          <section className="space-y-3">
            <label className={`
              flex items-center gap-4 p-5 rounded-2xl border cursor-pointer transition-colors
              ${isCustomerDebt ? 'bg-orange-50 border-orange-200' : 'bg-white border-zinc-100 hover:bg-zinc-50'}
            `}>
              <div className="flex-1 min-w-0">
                <p className={`text-lg font-black truncate ${isCustomerDebt ? 'text-orange-700' : 'text-zinc-700'}`}>Utang ng Customer</p>
                <p className={`text-sm font-medium ${isCustomerDebt ? 'text-orange-600/70' : 'text-zinc-400'}`}>Check mo kung nangutang ang customer</p>
              </div>
              <input 
                type="checkbox" 
                checked={isCustomerDebt}
                onChange={(e) => {
                  setIsCustomerDebt(e.target.checked)
                  if (e.target.checked) setIsExpense(false)
                }}
                className="w-7 h-7 rounded-lg border-zinc-300 text-orange-600 focus:ring-orange-500 bg-white"
              />
            </label>

            <label className={`
              flex items-center gap-4 p-5 rounded-2xl border cursor-pointer transition-colors
              ${isExpense ? 'bg-purple-50 border-purple-200' : 'bg-white border-zinc-100 hover:bg-zinc-50'}
            `}>
              <div className="flex-1 min-w-0">
                <p className={`text-lg font-black truncate ${isExpense ? 'text-purple-700' : 'text-zinc-700'}`}>Gastos / Bills</p>
                <p className={`text-sm font-medium ${isExpense ? 'text-purple-600/70' : 'text-zinc-400'}`}>Hindi na iikot ang pera (Kuryente, etc)</p>
              </div>
              <input 
                type="checkbox" 
                checked={isExpense}
                onChange={(e) => {
                  setIsExpense(e.target.checked)
                  if (e.target.checked) setIsCustomerDebt(false)
                }}
                className="w-7 h-7 rounded-lg border-zinc-300 text-purple-600 focus:ring-purple-500 bg-white"
              />
            </label>
          </section>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-zinc-100 pb-safe z-40">
        <div className="max-w-[400px] mx-auto">
          <button
            type="submit"
            className="w-full bg-zinc-900 text-white rounded-[1.5rem] py-5 text-xl font-black uppercase tracking-widest active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            Review Transaction
          </button>
        </div>
      </div>
    </form>
  )
}
