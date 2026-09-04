export default function Loading() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-zinc-50 pb-24 animate-pulse">
      {/* Wallet Header Skeleton */}
      <div className="bg-zinc-800 px-6 pt-10 pb-12 rounded-b-[2.5rem]">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-8 w-8 bg-zinc-700 rounded-full" />
          <div className="h-6 w-32 bg-zinc-700 rounded-full" />
        </div>
        <div className="h-4 w-40 bg-zinc-700 rounded-full mb-2" />
        <div className="h-12 w-64 bg-zinc-700 rounded-full" />
      </div>

      <div className="px-5 mt-6 relative z-10 flex justify-center">
        <div className="bg-white w-full rounded-3xl p-5 border border-zinc-100 flex flex-col items-center">
          <div className="h-4 w-32 bg-zinc-100 rounded-full mb-4" />
          <div className="w-full max-w-[16rem] aspect-square bg-zinc-100 rounded-2xl" />
        </div>
      </div>

      <div className="px-5 py-4 relative z-10">
        <div className="bg-white rounded-3xl p-5 border-2 border-zinc-100 flex items-center justify-between shadow-sm">
          <div className="space-y-2">
            <div className="h-6 w-32 bg-zinc-100 rounded-full" />
            <div className="h-4 w-48 bg-zinc-100 rounded-full" />
          </div>
          <div className="w-14 h-14 bg-zinc-100 rounded-full shrink-0" />
        </div>
      </div>

      <div className="px-5 mt-2 space-y-3">
        <div className="h-6 w-40 bg-zinc-200 rounded-full mb-4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-3xl p-6 border border-zinc-100 flex gap-4 shadow-sm">
            <div className="w-14 h-14 bg-zinc-100 rounded-full shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-5 w-3/4 bg-zinc-100 rounded-full" />
              <div className="h-4 w-1/2 bg-zinc-100 rounded-full" />
            </div>
            <div className="h-6 w-20 bg-zinc-100 rounded-full self-center" />
          </div>
        ))}
      </div>
    </div>
  )
}
