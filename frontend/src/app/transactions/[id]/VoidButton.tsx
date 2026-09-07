'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, AlertTriangle, X } from 'lucide-react'
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
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()

  let message = 'Are you sure you want to delete this transaction?'
  if (isTransfer) {
    message = 'This is a Transfer. Deleting this will also delete the paired transaction in the other wallet. Proceed?'
  } else if (isRepayment) {
    message = 'This is a Repayment. Deleting this will re-open the associated debt or obligation. Proceed?'
  }

  const handleVoid = async () => {
    setLoading(true)
    try {
      const result = await voidTransaction(transactionId)
      if (result?.success) {
        router.push('/')
        router.refresh()
      } else {
        alert(result?.error || 'Failed to delete transaction. Please try again.')
        setLoading(false)
        setShowModal(false)
      }
    } catch (e) {
      console.error(e)
      alert('Failed to delete transaction. Please try again.')
      setLoading(false)
      setShowModal(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        disabled={loading}
        className="w-full bg-red-50 text-red-600 rounded-2xl py-5 text-xl font-black uppercase tracking-widest active:scale-[0.98] transition-transform flex items-center justify-center gap-3 border border-red-100 disabled:opacity-50"
      >
        <Trash2 size={24} strokeWidth={2.5} />
        {loading ? 'Deleting...' : 'Delete / Void'}
      </button>

      {/* Custom Premium Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} strokeWidth={2.5} />
            </div>

            <h3 className="text-2xl font-black text-center text-zinc-900 mb-3 tracking-tight">
              Delete Transaction?
            </h3>
            
            <p className="text-zinc-500 text-center font-semibold mb-8 text-lg leading-snug">
              {message}
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleVoid}
                disabled={loading}
                className="w-full bg-red-500 text-white font-black text-lg uppercase tracking-wider py-4 rounded-2xl shadow-md active:scale-95 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {loading ? 'Deleting...' : 'Yes, Delete'}
              </button>
              
              <button
                onClick={() => !loading && setShowModal(false)}
                disabled={loading}
                className="w-full bg-zinc-100 text-zinc-600 font-bold text-lg uppercase tracking-wider py-4 rounded-2xl active:scale-95 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}
