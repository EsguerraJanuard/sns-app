import { getWallets } from "@/actions/wallet"
import TransactionForm from "./TransactionForm"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default async function NewTransactionPage({ searchParams }: { searchParams: Promise<{ dir?: string }> }) {
  const { dir } = await searchParams
  const wallets = await getWallets()
  const initialDirection = (dir === 'IN' || dir === 'OUT') ? dir : null

  return (
    <div className="flex-1 flex flex-col bg-zinc-50 min-h-screen">
      <main className="flex-1 pb-32">
        <TransactionForm wallets={wallets} initialDirection={initialDirection} />
      </main>
    </div>
  )
}
