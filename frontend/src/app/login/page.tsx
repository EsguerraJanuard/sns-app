import PinPad from './PinPad'

export default function LoginPage() {
  return (
    <main className="flex flex-col flex-1 w-full bg-zinc-50 min-h-screen items-center justify-center p-5">
      <div className="flex flex-col items-center text-center w-full max-w-sm">
        
        {/* Logo / Header */}
        <div className="w-24 h-24 bg-zinc-900 text-white rounded-3xl flex items-center justify-center shadow-xl mb-8">
          <span className="text-4xl font-black tracking-tighter">SNS</span>
        </div>
        
        <h1 className="text-2xl font-black text-zinc-900 mb-2">Welcome Back</h1>
        <p className="text-zinc-500 font-bold mb-8">Enter your PIN to unlock</p>

        <PinPad />

      </div>
    </main>
  )
}
