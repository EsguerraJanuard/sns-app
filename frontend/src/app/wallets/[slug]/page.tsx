import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft, ArrowDownRight, ArrowUpRight, Scale, Car, Smartphone, Landmark, Wallet as WalletIcon, Search } from "lucide-react"
import { getWalletBySlug } from "@/actions/wallet-details"
import { getRecentTransactions } from "@/actions/transaction"

import WalletHeader from "./WalletHeader"

const formatPHP = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount)
}

const formatPHPCompact = (amount: number) => {
  if (amount >= 1_000_000) {
    return '₱' + (amount / 1_000_000).toFixed(2).replace(/\.00$/, '') + 'M';
  }
  if (amount >= 100_000) {
    return '₱' + (amount / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return formatPHP(amount);
}

import { getWalletBrand } from "@/lib/walletUtils"

export default async function WalletPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const wallet = await getWalletBySlug(slug)
  
  if (!wallet) return notFound()

  const transactions = await getRecentTransactions(20, wallet.id)
  const Brand = getWalletBrand(wallet.name)
  const Icon = Brand.icon

  return (
    <div className="flex-1 flex flex-col bg-zinc-50 min-h-screen pb-24">
      <WalletHeader 
        walletName={wallet.name}
        expectedBalance={wallet.expected_balance}
      />

      {/* QR Code Section (Only for known wallets) */}
      {(slug === 'gcash' || slug === 'maya' || slug === 'maribank') && (
        <div className="px-5 pt-6 -mt-6 relative z-20 flex justify-center">
          <div className="bg-white w-full rounded-3xl p-5 shadow-sm border border-zinc-100 flex flex-col items-center">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Scan to Pay / Send</h3>
            <img 
              src={`/qr/${slug}.${slug === 'maribank' ? 'png' : 'jpg'}`} 
              alt={`${wallet.name} QR Code`} 
              className="w-full max-w-[16rem] aspect-square object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
      
      {/* Reconciliation Call to action */}
      <div className={`px-5 py-4 relative ${slug === 'gcash' || slug === 'maya' || slug === 'maribank' ? 'z-10' : 'z-20 -mt-6'}`}>
        <Link href={`/wallets/${wallet.slug}/check`} className="bg-white border-2 border-zinc-100 rounded-3xl p-5 flex items-center justify-between shadow-sm active:scale-95 transition-transform">
          <div>
            <div className="font-extrabold text-xl text-zinc-900">Check Balance</div>
            <div className="text-zinc-500 font-medium mt-1">
              {wallet.slug === 'cash' ? 'Does it match your physical cash?' : 'Does it match the real app?'}
            </div>
          </div>
          <div className={`${Brand.buttonBg} ${Brand.buttonColor} p-4 rounded-full shadow-sm`}>
            <Scale size={28} strokeWidth={2.5} />
          </div>
        </Link>
      </div>

      {/* History */}
      <section className="px-5 py-2">
        
        {/* Wallet Specific Search */}
        <form action="/transactions" method="GET" className="relative mb-6">
          <input type="hidden" name="wallet" value={wallet.id} />
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="text-zinc-400" size={20} />
          </div>
          <input 
            type="text"
            name="q"
            placeholder={`Search ${wallet.name} history...`}
            className="w-full bg-white text-zinc-900 rounded-2xl py-4 pl-12 pr-5 font-bold shadow-sm border border-zinc-100 focus:outline-none focus:border-zinc-300 placeholder:text-zinc-400"
          />
        </form>

        <h3 className="text-xl font-bold text-zinc-800 mb-4 px-1">Recent History</h3>
        <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden divide-y divide-zinc-100">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 font-medium text-lg">No transactions yet.</div>
          ) : (
            transactions.map((tx: any) => {
              const isIn = tx.direction === 'IN'
              const dateStr = new Date(tx.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
              return (
                <Link href={`/transactions/${tx.id}`} key={tx.id} className="p-6 flex items-center justify-between hover:bg-zinc-50 active:bg-zinc-100 transition-colors gap-3 block">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center shadow-sm ${Brand.bg} ${Brand.color}`}>
                      {isIn ? <ArrowDownRight size={28} strokeWidth={3} /> : <ArrowUpRight size={28} strokeWidth={3} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-black text-zinc-900 text-xl mb-0.5 leading-tight break-words">
                        {isIn ? 'From ' : 'To '}{tx.contact?.name || (tx.kind === 'TRANSFER' ? 'Transfer' : 'No name / Bills')}
                      </div>
                      <div className="text-base font-bold text-zinc-400 flex flex-wrap items-center gap-1.5 truncate">
                        <span>{dateStr}</span>
                        {tx.kind === 'BORROWED' && (
                          <>
                            <span>•</span>
                            <span className="text-red-500">Borrowed</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`text-2xl shrink-0 font-black tracking-tighter ${Brand.color}`}>
                    {isIn ? '+' : '-'}{formatPHPCompact(tx.amount)}
                  </div>
                </Link>
              )
            })
          )}
          
          <Link 
            href={`/transactions?wallet=${wallet.id}`}
            className="block w-full p-5 text-center bg-zinc-50 hover:bg-zinc-100 text-zinc-500 font-black uppercase tracking-widest text-sm transition-colors"
          >
            View All History
          </Link>
        </div>
      </section>
    </div>
  )
}
