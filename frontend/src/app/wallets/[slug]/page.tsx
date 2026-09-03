import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft, ArrowDownRight, ArrowUpRight, Scale, Car, Smartphone, Landmark, Wallet as WalletIcon } from "lucide-react"
import { getWalletBySlug } from "@/actions/wallet-details"
import { getRecentTransactions } from "@/actions/transaction"

const formatPHP = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount)
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

export default async function WalletPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const wallet = await getWalletBySlug(slug)
  
  if (!wallet) return notFound()

  const transactions = await getRecentTransactions(20, wallet.id)
  const Brand = getWalletBrand(wallet.name)
  const Icon = Brand.icon

  return (
    <div className="flex-1 flex flex-col bg-zinc-50 min-h-screen pb-24">
      {/* Header */}
      <header className={`${Brand.headerBg} text-white px-6 pt-10 pb-12 shadow-md rounded-b-[2rem] sticky top-0 z-10 transition-colors duration-300`}>
        <div className="flex items-center mb-6">
          <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors">
            <ChevronLeft size={28} />
          </Link>
          <div className="ml-2 flex items-center gap-2">
            <Icon size={24} className={Brand.color} />
            <h1 className="text-2xl font-black uppercase tracking-wide">{wallet.name}</h1>
          </div>
        </div>
        
        <div>
          <h2 className={`${Brand.color} text-lg font-medium mb-1`}>Expected balance</h2>
          <div className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            {formatPHP(wallet.expected_balance)}
          </div>
        </div>
      </header>
      
      {/* Reconciliation Call to action */}
      <div className="px-5 py-6 -mt-6 relative z-20">
        <Link href={`/wallets/${wallet.slug}/check`} className="bg-white border-2 border-zinc-100 rounded-3xl p-5 flex items-center justify-between shadow-sm active:scale-95 transition-transform">
          <div>
            <div className="font-extrabold text-xl text-zinc-900">Check Balance</div>
            <div className="text-zinc-500 font-medium mt-1">Does it match the real app?</div>
          </div>
          <div className={`${Brand.buttonBg} ${Brand.buttonColor} p-4 rounded-full shadow-sm`}>
            <Scale size={28} strokeWidth={2.5} />
          </div>
        </Link>
      </div>

      {/* History */}
      <section className="px-5 py-2">
        <h3 className="text-xl font-bold text-zinc-800 mb-4 px-1">Recent History</h3>
        <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden divide-y divide-zinc-100">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 font-medium text-lg">No transactions yet.</div>
          ) : (
            transactions.map((tx: any) => {
              const isIn = tx.direction === 'IN'
              return (
                <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${isIn ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'}`}>
                      {isIn ? <ArrowDownRight size={24} strokeWidth={3} /> : <ArrowUpRight size={24} strokeWidth={3} />}
                    </div>
                    <div>
                      <div className="font-bold text-zinc-900 text-lg mb-0.5">
                        {tx.contact?.name || (tx.kind === 'TRANSFER' ? 'Transfer' : 'No name / Bills')}
                      </div>
                      <div className="text-base text-zinc-500 font-medium">
                        {tx.kind === 'BORROWED' ? 'Borrowed' : (isIn ? 'Money in' : 'Money out')}
                      </div>
                    </div>
                  </div>
                  <div className={`text-xl font-black ${isIn ? 'text-green-600' : 'text-zinc-900'}`}>
                    {isIn ? '+' : '-'}{formatPHP(tx.amount)}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </section>
    </div>
  )
}
