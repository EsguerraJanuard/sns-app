import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { getActiveObligationsGrouped } from '@/actions/obligation'
import { getWallets } from '@/actions/wallet'
import { notFound } from 'next/navigation'
import RepaymentForm from './RepaymentForm'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function RepaymentPage({ params }: { params: Promise<{ contactId: string }> }) {
  const { contactId } = await params
  
  const obligations = await getActiveObligationsGrouped()
  const target = obligations.find(o => o.contactId === contactId)
  
  if (!target) return notFound()
  
  const wallets = await getWallets()
  const activeWallets = wallets.filter(w => w.is_active).sort((a, b) => a.sort_order - b.sort_order)

  return (
    <main className="flex flex-col min-h-screen bg-zinc-50 relative pb-24">
      {/* Header */}
      <header className="bg-red-500 text-white px-5 pt-8 pb-14 shadow-sm rounded-b-[2.5rem] relative z-20">
        <div className="flex items-center mb-6">
          <Link href="/obligations" className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <ChevronLeft size={32} />
          </Link>
          <h1 className="text-xl font-bold ml-2 tracking-wide uppercase truncate">Repay</h1>
        </div>

        <div className="px-2">
          <h2 className="text-red-100 text-sm font-bold uppercase tracking-widest mb-1 truncate">{target.name}</h2>
          <div className="text-5xl font-black tracking-tight text-white drop-shadow-sm truncate">
            ₱{target.total.toLocaleString()}
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="px-5 -mt-8 relative z-30">
        <RepaymentForm contactId={target.contactId} maxAmount={target.total} wallets={activeWallets} />
      </div>
    </main>
  )
}
