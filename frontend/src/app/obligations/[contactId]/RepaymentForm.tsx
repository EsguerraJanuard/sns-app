'use client'

import { useState, useTransition } from 'react'
import { repayObligation } from '@/actions/repayment'
import { WalletWithBalance } from '@/actions/wallet'
import { Loader2, Check, AlertTriangle } from 'lucide-react'

// Wallet Brand Utility
const getWalletBrand = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('gcash')) return { color: 'text-blue-600', bg: 'bg-blue-100', peer: 'peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600' };
  if (lower.includes('maya')) return { color: 'text-green-600', bg: 'bg-green-100', peer: 'peer-checked:bg-green-600 peer-checked:text-white peer-checked:border-green-600' };
  if (lower.includes('maribank')) return { color: 'text-orange-500', bg: 'bg-orange-100', peer: 'peer-checked:bg-orange-500 peer-checked:text-white peer-checked:border-orange-500' };
  if (lower.includes('cash')) return { color: 'text-amber-600', bg: 'bg-amber-100', peer: 'peer-checked:bg-amber-600 peer-checked:text-white peer-checked:border-amber-600' };
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
  wallets: WalletWithBalance[],
  isLent: boolean
}) {
  const [amount, setAmount] = useState<string>('')
  const [walletId, setWalletId] = useState<string>(wallets[0]?.id || '')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const rawAmount = Number(amount.replace(/,/g, '') || 0)
  const selectedWallet = wallets.find(w => w.id === walletId)
  const walletBalance = selectedWallet?.expected_balance ?? 0

  // For repaying (BORROWED): money goes OUT of our wallet.
  // For collecting (LENT): money comes IN, no balance check needed.
  const willDeductFromWallet = !isLent
  const projectedBalance = willDeductFromWallet ? walletBalance - rawAmount : walletBalance + rawAmount
  const isInsufficient = willDeductFromWallet && rawAmount > 0 && projectedBalance < 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!rawAmount || rawAmount <= 0) {
      setError('Please enter a valid amount.')
      return
    }
    if (rawAmount > maxAmount) {
      setError(`Amount cannot be more than the owed ₱${maxAmount.toLocaleString()}`)
      return
    }
    if (isInsufficient) {
      setError(`Hindi sapat ang ${selectedWallet?.name}! Laman: ₱${walletBalance.toLocaleString()}. Pumili ng ibang wallet.`)
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
            const isSelected = walletId === w.id
            const willDeduct = !isLent
            const projected = willDeduct ? w.expected_balance - rawAmount : w.expected_balance + rawAmount
            const wouldGoNegative = willDeduct && rawAmount > 0 && projected < 0

            return (
              <label key={w.id} className="relative cursor-pointer group active:scale-[0.98] transition-transform">
                <input 
                  type="radio" 
                  name="walletId" 
                  value={w.id} 
                  checked={isSelected}
                  onChange={() => setWalletId(w.id)}
                  className="peer sr-only" 
                />
                <div className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${wouldGoNegative && isSelected ? 'border-red-400 bg-red-50 text-red-700' : `border-zinc-200 bg-white text-zinc-500 ${Brand.peer}`}`}>
                  <div className="flex flex-col">
                    <div className="font-bold text-lg uppercase tracking-wide">{w.name}</div>
                    <div className={`text-sm font-bold mt-0.5 ${wouldGoNegative ? 'text-red-500' : isSelected ? 'text-white/80' : 'text-zinc-400'}`}>
                      Balance: ₱{w.expected_balance.toLocaleString()}
                      {isSelected && rawAmount > 0 && (
                        <span className={`ml-2 ${wouldGoNegative ? 'text-red-600 font-black' : 'text-white/80'}`}>
                          → ₱{Math.abs(projected).toLocaleString()}{wouldGoNegative ? ' ⚠️ Kulang!' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  {isSelected && !wouldGoNegative && (
                    <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center shrink-0">
                      <Check size={16} strokeWidth={4} />
                    </div>
                  )}
                  {wouldGoNegative && isSelected && (
                    <AlertTriangle size={22} className="text-red-500 shrink-0" />
                  )}
                </div>
              </label>
            )
          })}
        </div>
      </div>

      {/* Balance warning */}
      {isInsufficient && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex gap-3 items-start">
          <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-red-700 font-black text-sm">Hindi Sapat ang {selectedWallet?.name}!</div>
            <div className="text-red-600 font-bold text-sm mt-0.5">
              Kulang ng ₱{Math.abs(projectedBalance).toLocaleString()}. Pumili ng ibang wallet na may sapat na laman.
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-600 font-bold border border-red-200">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending || isInsufficient}
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
