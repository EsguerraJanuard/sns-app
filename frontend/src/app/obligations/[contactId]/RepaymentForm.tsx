'use client'

import { useState, useTransition } from 'react'
import { repayObligation } from '@/actions/repayment'
import { Wallet } from '@/actions/wallet'
import { Landmark, Smartphone, Wallet as WalletIcon, Loader2, Check } from 'lucide-react'

// Wallet Brand Utility
const getWalletBrand = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('gcash')) return { color: 'text-blue-600', bg: 'bg-blue-100', peer: 'peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600' };
  if (lower.includes('maya')) return { color: 'text-green-600', bg: 'bg-green-100', peer: 'peer-checked:bg-green-600 peer-checked:text-white peer-checked:border-green-600' };
  if (lower.includes('maribank')) return { color: 'text-orange-500', bg: 'bg-orange-100', peer: 'peer-checked:bg-orange-500 peer-checked:text-white peer-checked:border-orange-500' };
  if (lower.includes('cash')) return { color: 'text-emerald-600', bg: 'bg-emerald-100', peer: 'peer-checked:bg-emerald-600 peer-checked:text-white peer-checked:border-emerald-600' };
  if (lower.includes('auto-supply')) return { color: 'text-zinc-600', bg: 'bg-zinc-200', peer: 'peer-checked:bg-zinc-700 peer-checked:text-white peer-checked:border-zinc-700' };
  if (lower.includes('load')) return { color: 'text-purple-600', bg: 'bg-purple-100', peer: 'peer-checked:bg-purple-600 peer-checked:text-white peer-checked:border-purple-600' };
  return { color: 'text-zinc-500', bg: 'bg-zinc-100', peer: 'peer-checked:bg-zinc-600 peer-checked:text-white peer-checked:border-zinc-600' };
};

export default function RepaymentForm({ 
  contactId, 
  maxAmount, 
  wallets,
  isLent
}: { 
  contactId: string, 
  maxAmount: number, 
  wallets: Wallet[],
  isLent: boolean
}) {
  const [amount, setAmount] = useState<string>('')
  const [walletId, setWalletId] = useState<string>(wallets[0]?.id || '')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    const numAmount = Number(amount.replace(/,/g, ''))
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid amount.')
      return
    }
    if (numAmount > maxAmount) {
      setError(`Amount cannot be more than the owed ₱${maxAmount.toLocaleString()}`)
      return
    }

    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('contactId', contactId)
        formData.append('walletId', walletId)
        formData.append('amount', amount)
        if (isLent) formData.append('isLent', 'true')
        
        await repayObligation(formData)
      } catch (err: any) {
        setError(err.message || 'An error occurred.')
      }
    })
  }

  // Handle amount formatting while typing
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

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100 space-y-8">
      
      {/* Amount Input */}
      <div>
        <label className="block text-sm font-bold text-zinc-500 uppercase tracking-widest mb-3">
          {isLent ? 'Amount Paid by Customer' : 'Amount to Repay'}
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-black text-zinc-400">₱</div>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={handleAmountChange}
            className={`w-full bg-zinc-50 border-2 border-zinc-200 rounded-2xl py-5 pl-12 pr-5 text-4xl font-black text-zinc-900 focus:outline-none focus:ring-4 transition-all placeholder:text-zinc-300 ${isLent ? 'focus:border-orange-500 focus:ring-orange-100' : 'focus:border-red-500 focus:ring-red-100'}`}
            required
          />
        </div>
        <div className="mt-3 flex gap-2">
          <button 
            type="button" 
            onClick={() => setAmount(maxAmount.toLocaleString())} 
            className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full active:scale-95 transition-transform ${isLent ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}
          >
            {isLent ? 'Received Full Amount' : 'Pay Full Amount'}
          </button>
        </div>
      </div>

      {/* Wallet Selection */}
      <div>
        <label className="block text-sm font-bold text-zinc-500 uppercase tracking-widest mb-3">
          {isLent ? 'Deposit to' : 'Take money from'}
        </label>
        <div className="flex flex-col gap-3">
          {wallets.map(w => {
            const Brand = getWalletBrand(w.name)
            return (
              <label key={w.id} className="relative cursor-pointer group active:scale-[0.98] transition-transform">
                <input 
                  type="radio" 
                  name="walletId" 
                  value={w.id} 
                  checked={walletId === w.id}
                  onChange={() => setWalletId(w.id)}
                  className="peer sr-only" 
                />
                <div className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 border-zinc-200 bg-white text-zinc-500 transition-all ${Brand.peer}`}>
                  <div className="flex items-center gap-3">
                    <div className="font-bold text-lg uppercase tracking-wide group-hover:text-zinc-700 peer-checked:text-white transition-colors">{w.name}</div>
                  </div>
                  {walletId === w.id && (
                    <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center shrink-0">
                      <Check size={16} strokeWidth={4} />
                    </div>
                  )}
                </div>
              </label>
            )
          })}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-600 font-bold border border-red-200">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className={`w-full text-white rounded-2xl py-5 text-xl font-black uppercase tracking-widest active:scale-[0.98] transition-transform flex items-center justify-center disabled:opacity-70 ${isLent ? 'bg-orange-500' : 'bg-zinc-900'}`}
      >
        {isPending ? (
          <Loader2 size={28} className="animate-spin" />
        ) : (
          isLent ? 'Save Collection' : 'Save Repayment'
        )}
      </button>

    </form>
  )
}
