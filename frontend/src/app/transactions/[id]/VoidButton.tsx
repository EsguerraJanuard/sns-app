'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { voidTransaction } from '@/actions/transaction'

export default function VoidButton({ 
  transactionId,
  isTransfer,
  isRepayment
}: { 
  transactionId: string
  isTransfer?: boolean
  isRepayment?: boolean
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleVoid = async () => {
    let message = 'Are you sure you want to delete this transaction?'
    
    if (isTransfer) {
      message = 'This is a Transfer. Deleting this will also delete the paired transaction in the other wallet. Proceed?'
    } else if (isRepayment) {
      message = 'This is a Repayment. Deleting this will re-open the associated debt/obligation. Proceed?'
    }

    if (!window.confirm(message)) {
      return
    }

    setLoading(true)
    try {
      await voidTransaction(transactionId)
      router.push('/transactions')
      router.refresh()
    } catch (e) {
      console.error(e)
      alert('Failed to delete transaction. Please try again.')
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleVoid}
      disabled={loading}
      className="w-full bg-red-50 text-red-600 rounded-2xl py-5 text-xl font-black uppercase tracking-widest active:scale-[0.98] transition-transform flex items-center justify-center gap-3 border border-red-100 disabled:opacity-50"
    >
      <Trash2 size={24} strokeWidth={2.5} />
      {loading ? 'Deleting...' : 'Delete / Void'}
    </button>
  )
}
