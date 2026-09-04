import Link from "next/link"
import { ChevronLeft, ArrowDownRight, ArrowUpRight, Calendar, Landmark, User, FileText, Tag, Banknote, Edit3 } from "lucide-react"
import { getTransaction } from "@/actions/transaction"
import { getWalletBrand } from "@/lib/walletUtils"
import { notFound } from "next/navigation"
import VoidButton from "./VoidButton"

export const dynamic = 'force-dynamic'

export default async function TransactionDetailsPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const tx = await getTransaction(resolvedParams.id)

  if (!tx) {
    return notFound()
  }

  const isIn = tx.direction === 'IN'
  const Brand = getWalletBrand(tx.wallet?.name || '')
  const Icon = Brand.icon

  const date = new Date(tx.occurred_at)
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  const isVoided = tx.status === 'voided'

  return (
    <main className="flex flex-col min-h-screen bg-zinc-50 relative pb-24">
      {/* Header */}
      <header className={`${isVoided ? 'bg-zinc-800' : (isIn ? 'bg-green-500' : 'bg-blue-500')} text-white px-5 pt-8 pb-14 shadow-sm rounded-b-[2.5rem] relative z-20`}>
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <ChevronLeft size={32} />
          </Link>
          <div className="text-white/80 font-bold tracking-widest uppercase text-sm">
            {isVoided ? 'VOIDED RECORD' : (isIn ? 'Money Received' : 'Money Sent')}
          </div>
          <div className="w-8" /> {/* Spacer */}
        </div>

        <div className="text-center px-2">
          {isVoided && (
            <div className="inline-block bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full tracking-widest uppercase mb-4">
              Deleted / Voided
            </div>
          )}
          <h2 className="text-white/80 text-sm font-bold uppercase tracking-widest mb-1">Amount</h2>
          <div className={`text-5xl sm:text-6xl font-black tracking-tight drop-shadow-sm truncate ${isVoided ? 'text-zinc-500 line-through' : 'text-white'}`}>
            {isIn ? '+' : '-'}₱{tx.amount.toLocaleString()}
          </div>
        </div>
      </header>

      {/* Details Card */}
      <div className="px-5 -mt-8 relative z-30">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100 space-y-6">
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-500 flex items-center justify-center shrink-0">
              <User size={24} strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Person / Contact</p>
              <p className="text-xl font-black text-zinc-900 truncate">
                {tx.contact?.name || 'Unknown'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${Brand.bg} ${Brand.color}`}>
              <Icon size={24} strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Wallet / Account</p>
              <p className="text-xl font-black text-zinc-900 truncate uppercase">
                {tx.wallet?.name || 'Unknown'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-500 flex items-center justify-center shrink-0">
              <Calendar size={24} strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Date & Time</p>
              <p className="text-lg font-bold text-zinc-900">
                {formattedDate}
              </p>
              <p className="text-sm font-semibold text-zinc-500">
                {formattedTime}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-500 flex items-center justify-center shrink-0">
              <Tag size={24} strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Transaction Type</p>
              <p className="text-lg font-bold text-zinc-900">
                {tx.kind === 'CASH_IN' ? 'Money In' : 
                 tx.kind === 'CASH_OUT' ? 'Money Out' : 
                 tx.kind?.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
              </p>
            </div>
          </div>

          {tx.note && (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-500 flex items-center justify-center shrink-0">
                <FileText size={24} strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Note</p>
                <p className="text-lg font-bold text-zinc-900 break-words">
                  {tx.note}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 mt-6 space-y-3">
        {/* We removed the Edit button based on the user's preference to simplify and just void/recreate */}
        
        {!isVoided && (
          <VoidButton 
            transactionId={tx.id} 
            isTransfer={tx.kind === 'TRANSFER'} 
            isRepayment={tx.kind === 'REPAYMENT'} 
          />
        )}
      </div>

    </main>
  )
}
