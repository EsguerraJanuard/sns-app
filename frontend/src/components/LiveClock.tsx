'use client'

import { useState, useEffect } from 'react'

export default function LiveClock() {
  const [time, setTime] = useState<Date | null>(null)

  useEffect(() => {
    setTime(new Date())
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (!time) return <div className="h-5 mb-3" /> // placeholder

  const formattedDate = new Intl.DateTimeFormat('en-PH', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  }).format(time)

  const formattedTime = new Intl.DateTimeFormat('en-PH', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true
  }).format(time)

  const month = time.getMonth() + 1 // 1-12
  const date = time.getDate() // 1-31

  let easterEgg = null
  if (month === 9 && date === 12) {
    easterEgg = "🎂 Happy Birthday!"
  } else if ((month === 5 && date === 1) || (month === 2 && date === 14)) {
    easterEgg = "💖 Happy Wedding Anniversary!"
  }

  return (
    <div className="mb-3 text-center flex flex-col items-center">
      <div className="text-white/90 text-sm font-medium flex items-center justify-center gap-1.5">
        <span>{formattedDate}</span>
        <span>•</span>
        <span>{formattedTime}</span>
      </div>
      {easterEgg && (
        <div className="text-[#4A4A4A] font-bold bg-white inline-block px-3 py-1 rounded-full text-sm mt-2 animate-bounce shadow-sm">
          {easterEgg}
        </div>
      )}
    </div>
  )
}
