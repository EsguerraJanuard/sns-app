import { notFound } from "next/navigation"
import { getWalletBySlug } from "@/actions/wallet-details"
import CheckBalanceForm from "./CheckBalanceForm"

export default async function CheckBalancePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const wallet = await getWalletBySlug(slug)
  
  if (!wallet) return notFound()

  return <CheckBalanceForm walletId={wallet.id} walletName={wallet.name} expected={wallet.expected_balance} slug={slug} />
}
