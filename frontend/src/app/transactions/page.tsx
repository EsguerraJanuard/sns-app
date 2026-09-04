import Link from "next/link"
import { ChevronLeft, Search, ArrowDownRight, ArrowUpRight, Filter } from "lucide-react"
import { searchTransactions } from "@/actions/transaction"
import { getWallets } from "@/actions/wallet"
import DatePicker from "@/components/DatePicker"

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

import TransactionsClient from './TransactionsClient'

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const resolvedParams = await searchParams
  const q = resolvedParams.q
  const from = resolvedParams.from
  const to = resolvedParams.to
  const wallet = resolvedParams.wallet
  
  const transactions = await searchTransactions({
    query: q,
    dateFrom: from,
    dateTo: to,
    walletId: wallet
  })

  const wallets = await getWallets()
  const isFiltered = !!wallet

  return (
    <main className="flex flex-col flex-1 w-full bg-zinc-50 min-h-screen">
      
      <TransactionsClient
        wallets={wallets}
        initialQ={q}
        initialFrom={from}
        initialTo={to}
        initialWalletId={wallet}
      >
        {/* Results List */}
        <div className="px-5 py-8 flex-1 relative z-10 space-y-4">
          
          <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest pl-1">
            {transactions.length} Results Found
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden divide-y divide-zinc-50">
            {transactions.length === 0 ? (
              <div className="p-12 text-center text-zinc-400">
                <Search size={48} className="mx-auto mb-4 text-zinc-300" strokeWidth={1.5} />
                <div className="font-black text-xl text-zinc-600 mb-2">No results</div>
                <div className="text-sm font-medium">We couldn't find any transactions matching your search.</div>
              </div>
            ) : (
              transactions.map((tx: any) => {
                const isIn = tx.direction === 'IN'
                const wBrand = getWalletBrand(tx.wallet?.name || '')
                
                const dateStr = new Intl.DateTimeFormat('en-PH', { 
                  month: 'short', day: 'numeric', year: 'numeric' 
                }).format(new Date(tx.occurred_at))
                const showWalletBadge = !isFiltered
                const isMixedList = !isFiltered
                const amountColor = isFiltered ? 'text-zinc-900' : wBrand.color

                return (
                  <Link href={`/transactions/${tx.id}`} key={tx.id} className="p-6 flex items-center justify-between hover:bg-zinc-50 active:bg-zinc-100 transition-colors gap-3">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      {/* Icon */}
                      <div className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center shadow-sm ${wBrand.bg} ${wBrand.color}`}>
                        {isIn ? <ArrowDownRight size={28} strokeWidth={3} /> : <ArrowUpRight size={28} strokeWidth={3} />}
                      </div>
                      
                      {/* Details */}
                      <div className="min-w-0 flex-1">
                        <div className="font-black text-zinc-900 text-xl mb-0.5 leading-tight break-words pr-2">
                          {isIn ? 'From ' : 'To '}{tx.contact?.name || (tx.kind === 'TRANSFER' ? 'Transfer' : 'No name / Bills')}
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-400 font-bold text-sm flex-wrap">
                          {isIn ? 'To' : 'From'}
                          {showWalletBadge && (
                            <span className={`text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${wBrand.bg} ${wBrand.color} bg-opacity-10`}>
                              {tx.wallet?.name}
                            </span>
                          )}
                          {!showWalletBadge && <span>{tx.wallet?.name}</span>}
                          <span>•</span>
                          <span>
                            {new Date(tx.occurred_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Amount */}
                    <div className={`text-2xl font-black tracking-tighter shrink-0 text-right ${isMixedList ? amountColor : 'text-zinc-900'}`}>
                      {isIn ? '+' : '-'}{formatPHPCompact(tx.amount)}
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>

      </TransactionsClient>
    </main>
  )
}
