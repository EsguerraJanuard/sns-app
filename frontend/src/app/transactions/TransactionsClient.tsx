'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Search, Filter } from 'lucide-react'
import DatePicker from '@/components/DatePicker'
import { getWalletBrand } from '@/lib/walletUtils'

type Wallet = {
  id: string
  name: string
  slug: string
}

export default function TransactionsClient({
  wallets,
  initialQ,
  initialFrom,
  initialTo,
  initialWalletId,
  children
}: {
  wallets: Wallet[]
  initialQ?: string
  initialFrom?: string
  initialTo?: string
  initialWalletId?: string
  children: React.ReactNode
}) {
  const [selectedWalletId, setSelectedWalletId] = useState(initialWalletId || '')
  const selectedWallet = wallets.find(w => w.id === selectedWalletId)
  const themeBg = selectedWallet ? getWalletBrand(selectedWallet.name).headerBg : 'bg-zinc-900'

  return (
    <form action="/transactions" method="GET" className="flex flex-col min-h-screen">
      {/* Header Section (Dynamic Color) */}
      <header className={`${themeBg} text-white px-5 pt-8 pb-12 shadow-sm rounded-b-[2.5rem] relative z-20 transition-colors duration-500`}>
        <div className="flex items-center mb-6">
          <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <ChevronLeft size={32} />
          </Link>
          <h1 className="text-2xl font-bold ml-2 tracking-wide">Search History</h1>
        </div>

        {/* Main Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="text-zinc-400" size={24} />
          </div>
          <input 
            type="text"
            name="q"
            defaultValue={initialQ}
            placeholder="Search Name, Amount, or Note..."
            className="w-full bg-white text-zinc-900 rounded-[1.5rem] py-5 pl-14 pr-5 text-xl font-bold shadow-lg focus:outline-none focus:ring-4 focus:ring-white/20 placeholder:text-zinc-400"
          />
        </div>
      </header>

      {/* Filters Section (Overlapping White Card) */}
      <div className="px-5 -mt-8 relative z-30">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-zinc-100 space-y-4">
          
          <div className="flex items-center gap-2 mb-1 text-zinc-400">
            <Filter size={18} />
            <span className="text-sm font-bold uppercase tracking-widest">Filters</span>
          </div>

          <div className="flex flex-col gap-4">
            {/* Wallet Selection */}
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2">Wallet</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative col-span-2">
                  <input 
                    type="radio" 
                    id="wallet-all" 
                    name="wallet" 
                    value="" 
                    checked={selectedWalletId === ''} 
                    onChange={() => setSelectedWalletId('')} 
                    className="sr-only" 
                  />
                  <label htmlFor="wallet-all" className={`
                    flex items-center justify-center p-4 rounded-2xl cursor-pointer transition-all border-2
                    ${selectedWalletId === '' ? 'bg-zinc-800 text-white border-zinc-800 shadow-md' : 'bg-white border-zinc-100 text-zinc-400 hover:bg-zinc-50'}
                  `}>
                    <div className="flex flex-col items-center gap-1 w-full">
                      <span className="text-base font-black uppercase tracking-widest leading-tight text-center w-full">
                        ALL WALLETS
                      </span>
                    </div>
                  </label>
                </div>
                {wallets.map(w => {
                  const Brand = getWalletBrand(w.name)
                  const isChecked = selectedWalletId === w.id
                  return (
                    <div key={w.id} className="relative">
                      <input 
                        type="radio" 
                        id={`wallet-${w.id}`} 
                        name="wallet" 
                        value={w.id} 
                        checked={isChecked} 
                        onChange={() => setSelectedWalletId(w.id)} 
                        className="sr-only" 
                      />
                      <label htmlFor={`wallet-${w.id}`} className={`
                        flex items-center justify-center p-4 rounded-2xl cursor-pointer transition-all border-2
                        ${isChecked ? 'bg-white border-zinc-900 shadow-md' : 'bg-white border-zinc-100 hover:bg-zinc-50'}
                      `}>
                        <div className="flex flex-col items-center gap-2 w-full">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isChecked ? Brand.headerBg + ' text-white' : Brand.bg + ' ' + Brand.color}`}>
                            <Brand.icon size={20} strokeWidth={2.5} />
                          </div>
                          <span className={`text-sm sm:text-base uppercase tracking-widest transition-colors text-center w-full font-bold ${isChecked ? Brand.color : 'text-zinc-400'}`}>{w.name}</span>
                        </div>
                      </label>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Dates */}
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2">Date Range (Optional)</label>
              <div className="flex gap-3">
                <DatePicker name="from" defaultValue={initialFrom} />
                <DatePicker name="to" defaultValue={initialTo} />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className={`w-full ${themeBg} text-white font-black text-lg uppercase tracking-wider py-4 rounded-2xl shadow-md active:scale-95 transition-colors duration-500`}
          >
            Apply Search
          </button>
        </div>
      </div>

      {children}
    </form>
  )
}
