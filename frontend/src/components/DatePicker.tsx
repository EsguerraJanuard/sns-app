'use client'
import { Calendar } from "lucide-react"

export default function DatePicker({ name, defaultValue }: { name: string, defaultValue?: string }) {
  return (
    <div 
      className="relative flex-1 bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-2xl overflow-hidden flex items-center pl-4 transition-colors"
      onClick={(e) => {
        const input = e.currentTarget.querySelector('input')
        if (input && 'showPicker' in HTMLInputElement.prototype) {
          try { input.showPicker(); } catch (err) {}
        }
      }}
    >
      <Calendar size={18} className="text-zinc-400 shrink-0 pointer-events-none" />
      <input 
        type="date" 
        name={name}
        defaultValue={defaultValue}
        className="w-full bg-transparent py-4 pl-3 pr-2 text-sm font-bold text-zinc-700 focus:outline-none cursor-pointer"
      />
    </div>
  )
}
