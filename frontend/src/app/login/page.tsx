import PinPad from './PinPad'

export default function LoginPage() {
  return (
    <main className="flex flex-col flex-1 w-full bg-[#0a0a0c] min-h-screen items-center justify-center p-5 relative overflow-hidden">
      
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-green-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="flex flex-col items-center text-center w-full max-w-sm relative z-10">
        
        {/* Logo / Header */}
        <div className="w-24 h-24 bg-gradient-to-br from-zinc-800 to-zinc-950 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-black/50 mb-8 border border-zinc-800/50 relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-[2rem]" />
          <span className="text-4xl font-black tracking-tighter relative z-10">SNS</span>
        </div>
        
        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Welcome Back</h1>
        <p className="text-zinc-500 font-bold mb-10 text-lg">Enter your PIN to unlock</p>

        <PinPad />

      </div>
    </main>
  )
}
