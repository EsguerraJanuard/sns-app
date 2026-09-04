import Link from "next/link"
import { ArrowDownRight, ArrowUpRight, Plus, Car, Smartphone, Landmark, Wallet as WalletIcon, History, ArrowRight } from "lucide-react"
import { getWallets, Wallet } from "@/actions/wallet"
import { getTodaySummary, getRecentTransactions } from "@/actions/transaction"
import { getTotalDebts } from "@/actions/obligation"
import LiveClock from "@/components/LiveClock"
import { getWalletBrand } from "@/lib/walletUtils"

export const dynamic = 'force-dynamic'
export const revalidate = 0

const formatPHP = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
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

export default async function DashboardPage() {
  const wallets = await getWallets()
  const todaySummary = await getTodaySummary()
  const recentTxs = await getRecentTransactions(5)
  
  const totalOwed = await getTotalDebts('BORROWED')
  const totalCollect = await getTotalDebts('LENT')

  const totalExpected = wallets.reduce((sum, w) => sum + w.expected_balance, 0)

  // Desired specific order
  const gcash = wallets.find(w => w.name.toLowerCase().includes('gcash'))
  const maya = wallets.find(w => w.name.toLowerCase().includes('maya'))
  const maribank = wallets.find(w => w.name.toLowerCase().includes('maribank'))
  const cash = wallets.find(w => w.slug === 'cash')
  const load = wallets.find(w => w.name.toLowerCase().includes('load'))
  const autosupply = wallets.find(w => w.name.toLowerCase().includes('auto-supply'))
  
  const orderedWallets = [gcash, maya, maribank, cash, load, autosupply].filter(Boolean) as any[]

  return (
    <main className="flex flex-col flex-1 w-full pb-40 bg-zinc-50 min-h-screen relative">
      
      {/* Header / Total Expected */}
      <section className="bg-zinc-900 text-white px-6 pt-10 pb-16 shadow-lg rounded-b-[2.5rem] relative overflow-hidden flex flex-col items-center text-center">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        
        <LiveClock />
        <h2 className="text-white/70 text-sm font-black uppercase tracking-widest mt-6 mb-1">Total Expected Money</h2>
        <div className="text-5xl sm:text-6xl font-black tracking-tight text-white drop-shadow-sm truncate w-full">
          {formatPHPCompact(totalExpected)}
        </div>
      </section>

      <div className="px-5 py-6 space-y-8 flex-1 -mt-10 relative z-10">
        
        {/* Today's Summary */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100 flex gap-4 divide-x divide-zinc-100">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1 flex items-center gap-1">
              <ArrowDownRight size={16} className="text-green-500" strokeWidth={3} />
              MONEY IN
            </div>
            <div className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tighter whitespace-nowrap">{formatPHPCompact(todaySummary.in)}</div>
          </div>
          <div className="flex-1 pl-4 min-w-0">
            <div className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1 flex items-center gap-1">
              <ArrowUpRight size={16} className="text-blue-500" strokeWidth={3} />
              MONEY OUT
            </div>
            <div className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tighter whitespace-nowrap">{formatPHPCompact(todaySummary.out)}</div>
          </div>
        </section>
        
        {/* Wallets */}
        <section className="space-y-3 mt-8">
          <div className="flex items-center gap-2 mb-2 px-1">
            <WalletIcon size={22} className="text-zinc-400" />
            <h3 className="text-base font-bold text-zinc-500 uppercase tracking-widest">Wallets</h3>
          </div>
          
          <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden divide-y divide-zinc-50">
            {orderedWallets.map((wallet) => {
              const Brand = getWalletBrand(wallet.name)
              const Icon = Brand.icon

              return (
                <Link 
                  key={wallet.id} 
                  href={`/wallets/${wallet.slug}`}
                  className="p-4 sm:p-5 flex items-center justify-between hover:bg-zinc-50 active:bg-zinc-100 transition-colors gap-3"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${Brand.bg} ${Brand.color}`}>
                      <Icon size={24} strokeWidth={2.5} />
                    </div>
                    <div className="text-lg font-bold text-zinc-600 uppercase tracking-wide truncate">{wallet.name}</div>
                  </div>
                  <div className="text-2xl font-black text-zinc-900 shrink-0 text-right">{formatPHPCompact(wallet.expected_balance)}</div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Debts Section */}
        {totalOwed > 0 && totalCollect > 0 && (
          <section className="grid grid-cols-2 gap-3 mt-8">
            <Link 
              href="/obligations"
              className="bg-red-50 border-2 border-red-100 rounded-3xl p-5 flex flex-col justify-between shadow-sm active:scale-95 transition-transform min-h-[120px]"
            >
              <div className="text-red-600/70 text-xs font-black tracking-[0.1em] uppercase mb-1 leading-tight">Utang Mo<br/>(To Return)</div>
              <div className="font-extrabold text-2xl text-red-700 truncate tracking-tighter">{formatPHPCompact(totalOwed)}</div>
            </Link>
            
            <Link 
              href="/obligations?tab=lent"
              className="bg-orange-50 border-2 border-orange-100 rounded-3xl p-5 flex flex-col justify-between shadow-sm active:scale-95 transition-transform min-h-[120px]"
            >
              <div className="text-orange-600/70 text-xs font-black tracking-[0.1em] uppercase mb-1 leading-tight">Pautang<br/>(To Collect)</div>
              <div className="font-extrabold text-2xl text-orange-700 truncate tracking-tighter">{formatPHPCompact(totalCollect)}</div>
            </Link>
          </section>
        )}

        {totalOwed > 0 && totalCollect === 0 && (
          <section className="mt-8">
            <Link href="/obligations" className="bg-red-50 rounded-3xl p-6 shadow-sm border border-red-100 flex items-center justify-between group active:scale-[0.98] transition-transform">
              <div className="min-w-0">
                <div className="text-sm font-bold text-red-500 uppercase tracking-widest mb-1 truncate">
                  Borrowed Money
                </div>
                <div className="text-2xl font-black text-red-700 tracking-tighter truncate">
                  {formatPHPCompact(totalOwed)} <span className="text-lg font-bold opacity-70">to return</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors shrink-0">
                <ArrowRight size={24} strokeWidth={3} />
              </div>
            </Link>
          </section>
        )}

        {totalCollect > 0 && totalOwed === 0 && (
          <section className="mt-8">
            <Link href="/obligations?tab=lent" className="bg-orange-50 rounded-3xl p-6 shadow-sm border border-orange-100 flex items-center justify-between group active:scale-[0.98] transition-transform">
              <div className="min-w-0">
                <div className="text-sm font-bold text-orange-500 uppercase tracking-widest mb-1 truncate">
                  Pautang
                </div>
                <div className="text-2xl font-black text-orange-700 tracking-tighter truncate">
                  {formatPHPCompact(totalCollect)} <span className="text-lg font-bold opacity-70">to collect</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors shrink-0">
                <ArrowRight size={24} strokeWidth={3} />
              </div>
            </Link>
          </section>
        )}

        {/* Recent History */}
        <section className="space-y-3 pt-2">
          <div className="flex items-center gap-2 mb-2 px-1">
            <History size={22} className="text-zinc-400" />
            <h3 className="text-base font-bold text-zinc-500 uppercase tracking-widest">Recent Transactions</h3>
          </div>
          
          <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden divide-y divide-zinc-50">
            {recentTxs.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 font-medium text-lg">No transactions yet.</div>
            ) : (
              recentTxs.map((tx: any) => {
                const isIn = tx.direction === 'IN'
                const wBrand = getWalletBrand(tx.wallet?.name || '')
                const dateStr = new Date(tx.occurred_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
                
                return (
                  <Link href={`/transactions/${tx.id}`} key={tx.id} className="p-6 flex items-center justify-between hover:bg-zinc-50 active:bg-zinc-100 transition-colors gap-3">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      {/* Icon */}
                      <div className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center shadow-sm ${isIn ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {isIn ? <ArrowDownRight size={28} strokeWidth={3} /> : <ArrowUpRight size={28} strokeWidth={3} />}
                      </div>
                      
                      {/* Details */}
                      <div className="min-w-0 flex-1">
                        <div className="font-black text-zinc-900 text-xl mb-0.5 leading-tight break-words pr-2">
                          {isIn ? 'From ' : 'To '}{tx.contact?.name || (tx.kind === 'TRANSFER' ? 'Transfer' : 'No name / Bills')}
                        </div>
                        <div className="text-base font-bold text-zinc-400 flex items-center gap-1.5 flex-wrap">
                          {isIn ? 'To ' : 'From '}
                          <span className={wBrand.color}>{tx.wallet?.name || 'Unknown'}</span>
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
                    <div className={`text-2xl shrink-0 font-black tracking-tighter ${wBrand.color}`}>
                      {isIn ? '+' : '-'}{formatPHPCompact(tx.amount)}
                    </div>
                  </Link>
                )
              })
            )}
            
            {/* View All Button ALWAYS VISIBLE */}
            <Link 
              href="/transactions"
              className="block w-full p-5 text-center bg-zinc-50 hover:bg-zinc-100 text-zinc-500 font-black uppercase tracking-widest text-sm transition-colors"
            >
              View All History & Search
            </Link>
          </div>
        </section>

      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-zinc-50 via-zinc-50/90 to-transparent z-50 pointer-events-none max-w-[400px] mx-auto flex gap-3">
        <Link 
          href="/transaction/new?dir=IN"
          className="bg-green-600 text-white flex-1 py-5 rounded-[1.5rem] flex items-center justify-center gap-2 shadow-xl shadow-green-600/20 active:scale-95 transition-transform pointer-events-auto border-4 border-white"
        >
          <ArrowDownRight size={24} strokeWidth={3} />
          <span className="text-xl font-black tracking-wide">IN</span>
        </Link>
        <Link 
          href="/transaction/new?dir=OUT"
          className="bg-blue-600 text-white flex-1 py-5 rounded-[1.5rem] flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 active:scale-95 transition-transform pointer-events-auto border-4 border-white"
        >
          <ArrowUpRight size={24} strokeWidth={3} />
          <span className="text-xl font-black tracking-wide">OUT</span>
        </Link>
      </div>

    </main>
  )
}
