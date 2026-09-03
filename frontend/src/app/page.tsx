import Link from "next/link"
import { ArrowDownRight, ArrowUpRight, Plus, Car, Smartphone, Landmark, Wallet as WalletIcon, History } from "lucide-react"
import { getWallets, Wallet } from "@/actions/wallet"
import { getTodaySummary, getRecentTransactions } from "@/actions/transaction"
import LiveClock from "@/components/LiveClock"

const formatPHP = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount)
}

const getWalletBrand = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('maya')) return { icon: WalletIcon, color: 'text-green-600', bg: 'bg-green-100' };
  if (lower.includes('gcash')) return { icon: WalletIcon, color: 'text-blue-600', bg: 'bg-blue-100' };
  if (lower.includes('maribank')) return { icon: Landmark, color: 'text-orange-500', bg: 'bg-orange-100' };
  if (lower.includes('auto-supply')) return { icon: Car, color: 'text-zinc-700', bg: 'bg-zinc-200' };
  if (lower.includes('load')) return { icon: Smartphone, color: 'text-purple-600', bg: 'bg-purple-100' };
  return { icon: WalletIcon, color: 'text-zinc-500', bg: 'bg-zinc-100' };
};

function WalletCard({ wallet, isFull = false }: { wallet: Wallet, isFull?: boolean }) {
  const Brand = getWalletBrand(wallet.name)
  const Icon = Brand.icon

  return (
    <Link 
      href={`/wallets/${wallet.slug}`}
      className={`bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 hover:border-zinc-200 flex active:scale-95 transition-all ${isFull ? 'flex-row items-center justify-between w-full' : 'flex-col'}`}
    >
      <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isFull ? '' : 'mb-4'} ${Brand.bg} ${Brand.color}`}>
        <Icon size={28} strokeWidth={2.5} />
      </div>
      <div className={isFull ? 'text-right' : ''}>
        <div className="text-sm font-bold text-zinc-400 uppercase tracking-wide mb-1">{wallet.name}</div>
        <div className="text-2xl font-black text-zinc-900">{formatPHP(wallet.expected_balance)}</div>
      </div>
    </Link>
  )
}

export default async function DashboardPage() {
  const wallets = await getWallets()
  const todaySummary = await getTodaySummary()
  const recentTxs = await getRecentTransactions(5) // Fetch the last 5 transactions across all wallets

  const totalExpected = wallets.reduce((sum, w) => sum + w.expected_balance, 0)

  const gcash = wallets.find(w => w.name.toLowerCase().includes('gcash'))
  const maribank = wallets.find(w => w.name.toLowerCase().includes('maribank'))
  const maya = wallets.find(w => w.name.toLowerCase().includes('maya'))
  const autosupply = wallets.find(w => w.name.toLowerCase().includes('auto-supply'))
  const load = wallets.find(w => w.name.toLowerCase().includes('load'))

  return (
    <main className="flex flex-col flex-1 w-full pb-40 bg-zinc-50 min-h-screen relative">
      
      {/* Header / Total Expected */}
      <section className="bg-[#4A4A4A] text-white px-6 pt-10 pb-16 shadow-md rounded-b-[2.5rem] relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        
        <LiveClock />
        <h2 className="text-white/70 text-base font-bold uppercase tracking-widest mt-6 mb-1">Total Balance</h2>
        <div className="text-6xl font-black tracking-tight text-white drop-shadow-sm">
          {formatPHP(totalExpected)}
        </div>
      </section>

      <div className="px-5 py-6 space-y-10 flex-1 -mt-10 relative z-10">
        
        {/* Today's Summary */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100 flex gap-4 divide-x divide-zinc-100">
          <div className="flex-1">
            <div className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1 flex items-center gap-1">
              TODAY IN
            </div>
            <div className="text-3xl font-black text-green-600">+{formatPHP(todaySummary.in)}</div>
          </div>
          <div className="flex-1 pl-4">
            <div className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1 flex items-center gap-1">
              TODAY OUT
            </div>
            <div className="text-3xl font-black text-blue-600">-{formatPHP(todaySummary.out)}</div>
          </div>
        </section>

        {/* Wallets */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-3 px-1">
            <WalletIcon size={22} className="text-zinc-400" />
            <h3 className="text-base font-bold text-zinc-500 uppercase tracking-widest">Wallets</h3>
          </div>
          
          {/* Row 1 */}
          {gcash && <WalletCard wallet={gcash} isFull={true} />}
          
          {/* Row 2 */}
          <div className="grid grid-cols-2 gap-4">
            {maribank && <WalletCard wallet={maribank} />}
            {maya && <WalletCard wallet={maya} />}
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-2 gap-4">
            {autosupply && <WalletCard wallet={autosupply} />}
            {load && <WalletCard wallet={load} />}
          </div>
        </section>

        {/* Recent History */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center gap-2 mb-3 px-1">
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
                
                return (
                  <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-sm ${isIn ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {isIn ? <ArrowDownRight size={28} strokeWidth={3} /> : <ArrowUpRight size={28} strokeWidth={3} />}
                      </div>
                      
                      {/* Details */}
                      <div>
                        <div className="font-black text-zinc-900 text-xl mb-0.5 leading-tight">
                          {tx.contact?.name || (tx.kind === 'TRANSFER' ? 'Transfer' : 'No name / Bills')}
                        </div>
                        <div className="text-base font-bold text-zinc-400 flex items-center gap-1.5">
                          <span className={wBrand.color}>{tx.wallet?.name || 'Unknown'}</span>
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
                    <div className={`text-2xl font-black ${isIn ? 'text-green-600' : 'text-zinc-900'}`}>
                      {isIn ? '+' : '-'}{formatPHP(tx.amount)}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>

      </div>

      {/* Add Transaction Button */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-zinc-50 via-zinc-50/90 to-transparent z-50 pointer-events-none max-w-[400px] mx-auto">
        <Link 
          href="/transaction/new"
          className="bg-[#4A4A4A] text-white w-full py-5 rounded-[1.5rem] flex items-center justify-center gap-3 shadow-xl shadow-zinc-900/20 active:scale-95 transition-transform pointer-events-auto border-4 border-white"
        >
          <Plus size={28} strokeWidth={3} />
          <span className="text-2xl font-black tracking-wide">ADD TRANSACTION</span>
        </Link>
      </div>

    </main>
  )
}
