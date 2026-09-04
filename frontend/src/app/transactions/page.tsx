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
  
  const selectedWallet = wallets.find(w => w.id === wallet)
  const isFiltered = !!selectedWallet
  const themeBg = selectedWallet ? getWalletBrand(selectedWallet.name).headerBg : 'bg-zinc-900'

  return (
    <main className="flex flex-col flex-1 w-full bg-zinc-50 min-h-screen">
      
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
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative col-span-2">
                    <input type="radio" id="wallet-all" name="wallet" value="" defaultChecked={!wallet} className="peer sr-only" />
                    <label htmlFor="wallet-all" className={`
                      flex items-center justify-center p-4 rounded-2xl cursor-pointer transition-all border-2
                      ${!wallet ? 'bg-zinc-800 text-white border-zinc-800 shadow-md' : 'bg-white border-zinc-100 text-zinc-400 hover:bg-zinc-50'}
                      peer-checked:border-zinc-900 peer-checked:text-zinc-900
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
                    const isChecked = wallet === w.id
                    return (
                      <div key={w.id} className="relative">
                        <input type="radio" id={`wallet-${w.id}`} name="wallet" value={w.id} defaultChecked={isChecked} className="peer sr-only" />
                        <label htmlFor={`wallet-${w.id}`} className={`
                          flex items-center justify-center p-4 rounded-2xl cursor-pointer transition-all border-2
                          ${isChecked ? `bg-white ${Brand.border} shadow-sm ${Brand.shadow}` : 'bg-white border-zinc-100 hover:bg-zinc-50'}
                          peer-checked:border-zinc-900 peer-checked:shadow-md
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
                  <DatePicker name="from" defaultValue={from} />
                  <DatePicker name="to" defaultValue={to} />
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

      </form>
    </main>
  )
}
