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

const getBrandColor = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('maya')) return 'text-green-600'
  if (lower.includes('gcash')) return 'text-blue-600'
  if (lower.includes('maribank')) return 'text-orange-500'
  if (lower.includes('auto-supply')) return 'text-zinc-700'
  if (lower.includes('load')) return 'text-purple-600'
  return 'text-zinc-500'
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: { q?: string; from?: string; to?: string; wallet?: string }
}) {
  const { q, from, to, wallet } = searchParams
  
  const transactions = await searchTransactions({
    query: q,
    dateFrom: from,
    dateTo: to,
    walletId: wallet
  })

  const wallets = await getWallets()

  return (
    <main className="flex flex-col flex-1 w-full bg-zinc-50 min-h-screen">
      
      <form action="/transactions" method="GET" className="flex flex-col min-h-screen">
        {/* Header Section (Dark Gray) */}
        <header className="bg-[#4A4A4A] text-white px-5 pt-8 pb-12 shadow-sm rounded-b-[2rem] relative z-20">
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
              defaultValue={q}
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
              {/* Wallet Selection (Custom Radio Pills instead of Dropdown) */}
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2">Wallet</label>
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x no-scrollbar">
                  <label className="shrink-0 snap-start cursor-pointer">
                    <input type="radio" name="wallet" value="" defaultChecked={!wallet} className="peer hidden" />
                    <div className="px-5 py-3 rounded-2xl border-2 border-zinc-100 bg-zinc-50 text-zinc-500 font-bold peer-checked:border-zinc-800 peer-checked:bg-zinc-800 peer-checked:text-white transition-all">
                      All Wallets
                    </div>
                  </label>
                  {wallets.map(w => {
                    const Brand = getBrandColor(w.name)
                    return (
                      <label key={w.id} className="shrink-0 snap-start cursor-pointer">
                        <input type="radio" name="wallet" value={w.id} defaultChecked={wallet === w.id} className="peer hidden" />
                        <div className={`px-5 py-3 rounded-2xl border-2 border-zinc-100 bg-zinc-50 font-bold text-zinc-500 peer-checked:border-zinc-800 peer-checked:bg-zinc-800 peer-checked:text-white transition-all`}>
                          {w.name}
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Dates */}
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2">Date Range (Optional)</label>
                <div className="flex gap-3">
                  <DatePicker name="from" defaultValue={from} />
                  <DatePicker name="to" defaultValue={to} />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-[#4A4A4A] text-white font-black text-lg uppercase tracking-wider py-4 rounded-2xl shadow-md active:scale-95 transition-all"
            >
              Apply Search
            </button>
          </div>
        </div>

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
                const color = getBrandColor(tx.wallet?.name || '')
                
                const dateStr = new Intl.DateTimeFormat('en-PH', { 
                  month: 'short', day: 'numeric', year: 'numeric' 
                }).format(new Date(tx.occurred_at))

                return (
                  <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-zinc-50 transition-colors gap-3">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      {/* Icon */}
                      <div className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center shadow-sm ${isIn ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {isIn ? <ArrowDownRight size={28} strokeWidth={3} /> : <ArrowUpRight size={28} strokeWidth={3} />}
                      </div>
                      
                      {/* Details */}
                      <div className="min-w-0 flex-1">
                        <div className="font-black text-zinc-900 text-xl mb-0.5 leading-tight truncate">
                          {tx.contact?.name || (tx.kind === 'TRANSFER' ? 'Transfer' : 'No name / Bills')}
                        </div>
                        <div className="text-base font-bold text-zinc-400 flex flex-wrap items-center gap-1.5 truncate">
                          <span className={color}>{tx.wallet?.name || 'Unknown'}</span>
                          <span>•</span>
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
                    
                    {/* Amount */}
                    <div className={`text-2xl shrink-0 font-black tracking-tighter ${color}`}>
                      {isIn ? '+' : '-'}{formatPHPCompact(tx.amount)}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

      </form>
    </main>
  )
}
