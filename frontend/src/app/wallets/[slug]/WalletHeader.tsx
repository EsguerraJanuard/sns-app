'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Eye, EyeOff, Landmark, Car, Smartphone, Wallet as WalletIcon } from 'lucide-react'

const formatPHP = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount)
}

const formatPHPCompact = (amount: number) => {
  if (amount >= 1_000_000) return '₱' + (amount / 1_000_000).toFixed(2).replace(/\.00$/, '') + 'M'
  if (amount >= 100_000) return '₱' + (amount / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return formatPHP(amount)
}

const getWalletBrand = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('maya')) return { icon: WalletIcon, color: 'text-green-100', headerBg: 'bg-green-600', buttonColor: 'text-green-600', buttonBg: 'bg-green-100' };
  if (lower.includes('gcash')) return { icon: WalletIcon, color: 'text-blue-100', headerBg: 'bg-blue-600', buttonColor: 'text-blue-600', buttonBg: 'bg-blue-100' };
  if (lower.includes('maribank')) return { icon: Landmark, color: 'text-orange-100', headerBg: 'bg-orange-500', buttonColor: 'text-orange-500', buttonBg: 'bg-orange-100' };
  if (lower.includes('auto-supply')) return { icon: Car, color: 'text-zinc-100', headerBg: 'bg-zinc-800', buttonColor: 'text-zinc-700', buttonBg: 'bg-zinc-200' };
  if (lower.includes('load')) return { icon: Smartphone, color: 'text-purple-100', headerBg: 'bg-purple-600', buttonColor: 'text-purple-600', buttonBg: 'bg-purple-100' };
  return { icon: WalletIcon, color: 'text-zinc-100', headerBg: 'bg-blue-600', buttonColor: 'text-blue-600', buttonBg: 'bg-blue-100' };
};

export default function WalletHeader({ 
  walletName, 
  expectedBalance 
}: { 
  walletName: string, 
  expectedBalance: number
}) {
  const [showBalance, setShowBalance] = useState(false)
  const Brand = getWalletBrand(walletName)
  const Icon = Brand.icon

  return (
    <header className={`${Brand.headerBg} text-white px-6 pt-10 pb-12 shadow-md rounded-b-[2.5rem] sticky top-0 z-10 transition-colors duration-300`}>
      <div className="flex items-center mb-6">
        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors">
          <ChevronLeft size={28} />
        </Link>
        <div className="ml-2 flex items-center gap-2">
          <Icon size={24} className={Brand.color} />
          <h1 className="text-2xl font-black uppercase tracking-wide">{walletName}</h1>
        </div>
      </div>
      
      <div>
        <h2 className={`${Brand.color} text-lg font-medium mb-2`}>Expected balance</h2>
        <div 
          onClick={() => setShowBalance(!showBalance)}
          className="flex items-center gap-4 cursor-pointer active:scale-95 transition-transform"
        >
          <div className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            {showBalance ? formatPHPCompact(expectedBalance) : '••••••••'}
          </div>
          <button className={`w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors ${Brand.color}`}>
            {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>
    </header>
  )
}
