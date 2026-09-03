'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowDownRight, ArrowUpRight, Search, CheckCircle2, Wallet as WalletIcon, ChevronLeft, Car, Smartphone, Landmark } from 'lucide-react'
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
  const [direction, setDirection] = useState<'IN' | 'OUT' | null>(null)
  const [contactName, setContactName] = useState('')
  const [contactSuggestions, setContactSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [amount, setAmount] = useState('')
  const [walletId, setWalletId] = useState<string>('')
  const [isBorrowed, setIsBorrowed] = useState(false)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

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
      // If direction isn't set, default to IN just to move flow along, or just focus contact
      contactRef.current?.focus()
    }
  }

  const handleContactKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      // Hide keyboard by blurring
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
      const p = raw.split('.')
      p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      setAmount(p.join('.'))
    } else {
      setAmount('')
    }
  }

  const handleSaveClick = (e: React.FormEvent) => {
    e.preventDefault()
    if (!direction || !amount || !walletId) return
    setShowConfirmModal(true)
  }

  const executeSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      await createTransaction({
        direction: direction!,
        contact_name: contactName || undefined,
        amount: Number(amount.replace(/,/g, '')),
        wallet_id: walletId,
        kind: isBorrowed ? 'BORROWED' : 'REGULAR'
      })
      
      setShowConfirmModal(false)
      setIsSuccess(true)
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } catch (error) {
      console.error(error)
      alert("We couldn't save this transaction. Please try again.")
      setIsSubmitting(false)
      setShowConfirmModal(false)
    }
  }

  const formatPHP = (val: string) => {
    const num = Number(val.replace(/,/g, ''))
    if (isNaN(num)) return '₱0.00'
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(num)
  }

  const selectedWalletName = wallets.find(w => w.id === walletId)?.name

  const activeBrand = selectedWalletName 
    ? getWalletBrand(selectedWalletName) 
    : { solidBg: 'bg-[#4A4A4A]', shadow: 'shadow-[#4A4A4A]/30' }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <CheckCircle2 size={96} className="text-green-500" strokeWidth={2.5} />
        <h2 className="text-3xl font-black text-zinc-900">Na-save na!</h2>
      </div>
    )
  }

  return (
    <>
      <form onSubmit={handleSaveClick} className="flex flex-col min-h-screen">
        
        {/* Dynamic Header Section */}
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
                required
              />
            </div>
          </div>
        </header>

        {/* Form Fields Section */}
        <div className="px-5 py-6 space-y-6 flex-1 -mt-4 bg-zinc-50 relative z-0">
          
          {/* Direction */}
          <section className="bg-white p-1.5 rounded-3xl flex gap-1 shadow-sm border border-zinc-100">
            <button
              type="button"
              onClick={() => setDirection('IN')}
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
              onClick={() => setDirection('OUT')}
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

          {/* Contact */}
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
                className="w-full pl-12 pr-4 py-4 text-lg font-bold rounded-2xl bg-white border border-zinc-100 shadow-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:font-medium placeholder:text-zinc-300"
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

          {/* Wallet */}
          <section className="space-y-2">
            <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider block px-1">Saan?</label>
            <div className="grid grid-cols-2 gap-2">
              {wallets.map((w, index) => {
                const isLastOdd = index === wallets.length - 1 && wallets.length % 2 !== 0;
                const Brand = getWalletBrand(w.name);
                const Icon = Brand.icon;
                const isSelected = walletId === w.id;
                
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setWalletId(w.id)}
                    className={`py-4 px-3 rounded-2xl text-base font-bold transition-all flex items-center justify-center gap-2 border shadow-sm ${
                      isLastOdd ? 'col-span-2' : ''
                    } ${
                      isSelected 
                        ? `${Brand.bg} ${Brand.border} ${Brand.color} ring-2 ring-offset-1 ring-${Brand.color.split('-')[1]}-500/30` 
                        : `bg-white ${Brand.border} opacity-80 hover:opacity-100 text-zinc-700`
                    }`}
                  >
                    <div className={`p-1 rounded-full ${isSelected ? 'bg-white/50' : Brand.bg} ${Brand.color}`}>
                      <Icon size={18} strokeWidth={2.5} />
                    </div>
                    {w.name}
                  </button>
                )
              })}
            </div>
          </section>

          {/* Borrowed Toggle */}
          {direction === 'IN' && (
            <section className="pt-2">
              <button
                type="button"
                onClick={() => setIsBorrowed(!isBorrowed)}
                className={`w-full py-4 px-5 rounded-2xl font-bold text-base border shadow-sm transition-all flex items-center justify-between ${
                  isBorrowed 
                    ? 'bg-red-50 border-red-200 text-red-700' 
                    : 'bg-white border-zinc-100 text-zinc-500 hover:bg-zinc-50'
                }`}
              >
                <span>Inutang ba itong pera?</span>
                <div className={`w-12 h-7 rounded-full transition-colors flex items-center px-1 ${isBorrowed ? 'bg-red-500' : 'bg-zinc-200'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${isBorrowed ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </button>
            </section>
          )}

          {/* Submit */}
          <div className="pt-6 pb-12">
            <button
              type="submit"
              disabled={!direction || !amount || !walletId}
              className={`w-full ${activeBrand.solidBg} disabled:bg-zinc-300 disabled:shadow-none text-white text-xl font-bold py-5 rounded-2xl shadow-xl ${activeBrand.shadow} active:scale-95 transition-all`}
            >
              SAVE TRANSACTION
            </button>
          </div>

        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-6 text-center space-y-2">
              <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                {direction === 'IN' ? <ArrowDownRight size={32} strokeWidth={3} /> : <ArrowUpRight size={32} strokeWidth={3} />}
              </div>
              <h3 className="text-2xl font-bold text-zinc-900">I-save ito?</h3>
              <p className="text-zinc-500 font-medium">Pakicheck kung tama ang detalye.</p>
              
              <div className="bg-zinc-50 rounded-2xl p-4 mt-6 space-y-3 text-left border border-zinc-100">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Amount</span>
                  <span className={`font-bold ${direction === 'IN' ? 'text-green-600' : 'text-zinc-900'}`}>
                    {direction === 'IN' ? '+' : '-'}{formatPHP(amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Saan</span>
                  <span className="font-bold text-zinc-900">{selectedWalletName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Kanino</span>
                  <span className="font-bold text-zinc-900">{contactName || 'No name (Bills/Load)'}</span>
                </div>
                {direction === 'IN' && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Utang?</span>
                    <span className={`font-bold ${isBorrowed ? 'text-red-600' : 'text-zinc-900'}`}>
                      {isBorrowed ? 'Oo' : 'Hindi'}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex gap-3">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-4 text-zinc-600 font-bold bg-white rounded-xl border border-zinc-200 active:bg-zinc-100 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                onClick={executeSubmit}
                className="flex-1 py-4 text-white font-bold bg-blue-600 rounded-xl shadow-lg active:scale-95 transition-transform disabled:opacity-70"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
