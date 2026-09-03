'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, CheckCircle2, Car, Smartphone, Landmark, Wallet as WalletIcon } from 'lucide-react'
import { saveReconciliation } from '@/actions/reconcile'

const getWalletBrand = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('maya')) return { icon: WalletIcon, color: 'text-green-100', headerBg: 'bg-green-600', buttonColor: 'text-green-600', buttonBg: 'bg-green-100' };
  if (lower.includes('gcash')) return { icon: WalletIcon, color: 'text-blue-100', headerBg: 'bg-blue-600', buttonColor: 'text-blue-600', buttonBg: 'bg-blue-100' };
  if (lower.includes('maribank')) return { icon: Landmark, color: 'text-orange-100', headerBg: 'bg-orange-500', buttonColor: 'text-orange-500', buttonBg: 'bg-orange-100' };
  if (lower.includes('auto-supply')) return { icon: Car, color: 'text-zinc-100', headerBg: 'bg-zinc-800', buttonColor: 'text-zinc-700', buttonBg: 'bg-zinc-200' };
  if (lower.includes('load')) return { icon: Smartphone, color: 'text-purple-100', headerBg: 'bg-purple-600', buttonColor: 'text-purple-600', buttonBg: 'bg-purple-100' };
  return { icon: WalletIcon, color: 'text-zinc-100', headerBg: 'bg-blue-600', buttonColor: 'text-blue-600', buttonBg: 'bg-blue-100' };
};

export default function CheckBalanceForm({ walletId, walletName, expected, slug }: { walletId: string, walletName: string, expected: number, slug: string }) {
  const router = useRouter()
  const [actualStr, setActualStr] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{ diff: number, checked: true } | null>(null)

  const Brand = getWalletBrand(walletName)
  const Icon = Brand.icon

  const handleActualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^0-9.]/g, '')
    const parts = raw.split('.')
    if (parts.length > 2) raw = parts[0] + '.' + parts.slice(1).join('')
    if (parts[1] && parts[1].length > 2) raw = `${parts[0]}.${parts[1].slice(0, 2)}`
    
    if (raw) {
      const p = raw.split('.')
      p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      setActualStr(p.join('.'))
    } else {
      setActualStr('')
    }
  }

  const actual = Number(actualStr.replace(/,/g, ''))
  
  const handleCheck = async () => {
    if (!actualStr) return
    setIsSubmitting(true)
    
    const diff = actual - expected
    
    await saveReconciliation({
      wallet_id: walletId,
      expected_balance: expected,
      observed_balance: actual,
      difference: diff
    })
    
    setResult({ diff, checked: true })
    setIsSubmitting(false)
  }

  const formatPHP = (amount: number) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount)
  }

  if (result) {
    const isExact = result.diff === 0
    const isLower = result.diff < 0
    
    return (
      <div className="p-6 pt-16 space-y-8 flex flex-col items-center text-center bg-zinc-50 min-h-screen">
        {isExact ? (
          <>
            <CheckCircle2 size={96} className="text-green-500" strokeWidth={3} />
            <h2 className="text-4xl font-extrabold text-zinc-900">Sakto!</h2>
            <p className="text-xl text-zinc-600 font-medium">Ang record mo at ang tunay na {walletName} {slug === 'cash' ? '' : 'app '}ay parehong-pareho.</p>
          </>
        ) : (
          <>
            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl font-black shadow-sm ${isLower ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
              !
            </div>
            <h2 className="text-3xl font-extrabold text-zinc-900">May kulang o sobra!</h2>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-200 w-full space-y-3">
               <p className="text-xl text-zinc-600 font-medium">
                Ang totoong laman ng {slug === 'cash' ? 'Cash' : 'app'} mo ay mas <strong className="text-zinc-900 font-black">{isLower ? 'MABABA' : 'MATAAS'}</strong> ng <strong className="text-zinc-900 font-black">{formatPHP(Math.abs(result.diff))}</strong> kaysa sa inaasahan.
              </p>
              <hr className="border-zinc-100" />
              <p className="text-lg text-zinc-500 font-medium">I-check ang "Recent History" para hanapin kung may nakalimutan kang ilista kanina.</p>
            </div>
          </>
        )}
        
        <Link href={`/wallets/${slug}`} className={`mt-8 ${Brand.headerBg} text-white px-8 py-5 rounded-2xl text-xl font-bold shadow-xl w-full active:scale-95 transition-transform`}>
          Done
        </Link>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-zinc-50 min-h-screen">
      <header className={`${Brand.headerBg} text-white px-5 pt-8 pb-10 shadow-md rounded-b-[2rem] relative z-10 transition-colors duration-300`}>
        <div className="flex items-center mb-6">
          <Link href={`/wallets/${slug}`} className="p-2 -ml-2 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors">
            <ChevronLeft size={28} />
          </Link>
          <div className="ml-2 flex items-center gap-2">
            <h1 className="text-xl font-bold">Check Balance</h1>
          </div>
        </div>
        
        <div className="text-center mt-2">
          <label className={`${Brand.color} text-sm font-bold uppercase tracking-widest block mb-1`}>Expected na laman</label>
          <div className="text-5xl font-black">{formatPHP(expected)}</div>
        </div>
      </header>

      <main className="p-5 space-y-8 flex-1 -mt-4 relative z-0">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-zinc-100 space-y-6">
          <label className="text-xl font-bold text-zinc-900 text-center block leading-snug">
            Magkano ang naka-display na laman ngayon sa totoong <span className={Brand.buttonColor}>{walletName}</span> {slug === 'cash' ? '' : 'app '}mo?
          </label>
          <div className="relative">
            <span className={`absolute left-5 top-1/2 -translate-y-1/2 text-4xl font-extrabold ${actualStr ? 'text-zinc-900' : 'text-zinc-300'}`}>₱</span>
            <input 
              type="text"
              inputMode="decimal"
              value={actualStr}
              onChange={handleActualChange}
              placeholder="0.00"
              className="w-full pl-14 pr-5 py-6 text-4xl font-extrabold rounded-2xl bg-zinc-50 border border-zinc-100 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors shadow-inner"
            />
          </div>
        </div>

        <div className="space-y-4 mt-8">
          <button
            onClick={handleCheck}
            disabled={isSubmitting || !actualStr}
            className={`w-full ${Brand.headerBg} disabled:opacity-50 disabled:shadow-none text-white text-2xl font-black py-5 rounded-[1.5rem] shadow-xl active:scale-95 transition-all`}
          >
            {isSubmitting ? 'Checking...' : 'CHECK'}
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-zinc-200"></div>
            <span className="flex-shrink-0 mx-4 text-zinc-400 font-bold text-sm uppercase tracking-widest">Or</span>
            <div className="flex-grow border-t border-zinc-200"></div>
          </div>

          <button
            onClick={async () => {
              setIsSubmitting(true)
              await saveReconciliation({
                wallet_id: walletId,
                expected_balance: expected,
                observed_balance: expected,
                difference: 0
              })
              setResult({ diff: 0, checked: true })
              setIsSubmitting(false)
            }}
            disabled={isSubmitting}
            className={`w-full bg-white border-2 ${Brand.border} ${Brand.buttonColor} text-xl font-bold py-4 rounded-[1.5rem] shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2`}
          >
            <CheckCircle2 size={24} strokeWidth={2.5} />
            Sakto ang laman!
          </button>
        </div>
      </main>
    </div>
  )
}
