'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Delete } from 'lucide-react'
import { loginWithPin } from '@/actions/auth'

export default function PinPad() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (pin.length === 4) {
      handleLogin(pin)
    }
  }, [pin])

  const handleLogin = async (completePin: string) => {
    setLoading(true)
    setError('')
    
    const result = await loginWithPin(completePin)
    
    if (result.error) {
      setError('Mali ang PIN. Subukan ulit.')
      setPin('')
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  const handleNumber = (num: string) => {
    if (pin.length < 4 && !loading) {
      setPin(prev => prev + num)
      setError('')
    }
  }

  const handleDelete = () => {
    if (!loading) {
      setPin(prev => prev.slice(0, -1))
      setError('')
    }
  }

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto mt-12">
      
      {/* PIN Dots */}
      <div className="flex gap-6 mb-12">
        {[0, 1, 2, 3].map(i => (
          <div 
            key={i}
            className={`w-5 h-5 rounded-full transition-all duration-300 ${
              pin.length > i ? 'bg-zinc-800 scale-110' : 'bg-zinc-200'
            }`}
          />
        ))}
      </div>

      {error && (
        <div className="text-red-500 font-bold mb-6 animate-pulse">
          {error}
        </div>
      )}

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-x-8 gap-y-6 w-full">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            onClick={() => handleNumber(num.toString())}
            disabled={loading}
            className="flex items-center justify-center w-20 h-20 mx-auto rounded-full text-3xl font-black text-zinc-800 bg-white shadow-sm border border-zinc-100 hover:bg-zinc-50 active:bg-zinc-200 active:scale-95 transition-all"
          >
            {num}
          </button>
        ))}
        
        <div className="flex items-center justify-center w-20 h-20 mx-auto" /> {/* Empty spot */}
        
        <button
          onClick={() => handleNumber('0')}
          disabled={loading}
          className="flex items-center justify-center w-20 h-20 mx-auto rounded-full text-3xl font-black text-zinc-800 bg-white shadow-sm border border-zinc-100 hover:bg-zinc-50 active:bg-zinc-200 active:scale-95 transition-all"
        >
          0
        </button>

        <button
          onClick={handleDelete}
          disabled={loading || pin.length === 0}
          className="flex items-center justify-center w-20 h-20 mx-auto rounded-full text-zinc-500 hover:text-zinc-800 active:scale-95 transition-all"
        >
          <Delete size={32} />
        </button>
      </div>

    </div>
  )
}
