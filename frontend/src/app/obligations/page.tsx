import Link from "next/link"
import { ChevronLeft, Landmark, ArrowDownRight, ArrowRight } from "lucide-react"
import { getActiveObligationsGrouped } from "@/actions/obligation"

export const dynamic = 'force-dynamic'
export const revalidate = 0

const formatPHPCompact = (amount: number) => {
  if (amount >= 1_000_000) {
    return '₱' + (amount / 1_000_000).toFixed(2).replace(/\.00$/, '') + 'M';
  }
  if (amount >= 100_000) {
    return '₱' + (amount / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export default async function ObligationsPage() {
  const obligations = await getActiveObligationsGrouped()

  const totalOwed = obligations.reduce((sum, o) => sum + o.total, 0)

  return (
    <main className="flex flex-col flex-1 w-full bg-zinc-50 min-h-screen">
      
      {/* Header Section */}
      <header className="bg-red-500 text-white px-5 pt-8 pb-12 shadow-sm rounded-b-[2.5rem] relative z-20">
        <div className="flex items-center mb-6">
          <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <ChevronLeft size={32} />
          </Link>
          <h1 className="text-2xl font-bold ml-2 tracking-wide uppercase">Borrowed Money</h1>
        </div>

        <div className="px-2">
          <h2 className="text-white/80 text-sm font-bold uppercase tracking-widest mb-1">Total to Return</h2>
          <div className="text-5xl font-black tracking-tight text-white drop-shadow-sm">
            {formatPHPCompact(totalOwed)}
          </div>
        </div>
      </header>

      {/* List */}
      <div className="px-5 py-8 flex-1 relative z-10 space-y-4">
        
        <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest pl-1">
          {obligations.length} People to Repay
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden divide-y divide-zinc-50">
          {obligations.length === 0 ? (
            <div className="p-12 text-center text-zinc-400">
              <Landmark size={48} className="mx-auto mb-4 text-zinc-300" strokeWidth={1.5} />
              <div className="font-black text-xl text-zinc-600 mb-2">No borrowed money</div>
              <div className="text-sm font-medium">You don't have any active obligations.</div>
            </div>
          ) : (
            obligations.map((ob: any) => (
              <div key={ob.contactId} className="p-6 flex items-center justify-between hover:bg-zinc-50 transition-colors gap-3">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-full flex items-center justify-center shadow-sm bg-red-100 text-red-600">
                    <ArrowDownRight size={24} strokeWidth={3} />
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="font-black text-zinc-900 text-lg sm:text-xl mb-0.5 leading-tight break-words">
                      {ob.name}
                    </div>
                    <div className="text-sm sm:text-base font-bold text-red-500 flex items-center gap-1.5 break-words leading-tight">
                      Needs repayment
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                  <div className="text-xl sm:text-2xl font-black tracking-tighter text-zinc-900 shrink-0">
                    {formatPHPCompact(ob.total)}
                  </div>
                  {/* TODO: Add repayment button/link here when we build repayment feature */}
                  <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 hover:bg-zinc-200 transition-colors shrink-0">
                    <ArrowRight size={20} strokeWidth={3} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
