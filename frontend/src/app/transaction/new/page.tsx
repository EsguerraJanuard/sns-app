import { getWallets } from "@/actions/wallet"
import TransactionForm from "./TransactionForm"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default async function NewTransactionPage({ searchParams }: { searchParams: Promise<{ type?: string, contact?: string }> }) {
  const { type, contact } = await searchParams
  const wallets = await getWallets()
  const initialDirection = (type === 'in' || type === 'out') ? type.toUpperCase() as 'IN' | 'OUT' : null
  const initialContact = contact || ''

  return (
    <div className="flex-1 flex flex-col bg-zinc-50 min-h-screen">
      <main className="flex-1 pb-32">
        <TransactionForm wallets={wallets} initialDirection={initialDirection} initialContact={initialContact} />
      </main>
    </div>
  )
}
