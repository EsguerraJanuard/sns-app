export default function Loading() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-zinc-50 pb-24 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-zinc-800 px-6 pt-10 pb-12 rounded-b-[2.5rem]">
        <div className="h-6 w-32 bg-zinc-700 rounded-full mb-6" />
        <div className="h-4 w-40 bg-zinc-700 rounded-full mb-2" />
        <div className="h-12 w-64 bg-zinc-700 rounded-full" />
      </div>

      <div className="px-5 mt-6 grid grid-cols-2 gap-3 relative z-10">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-3xl p-5 border border-zinc-100 flex flex-col items-center gap-2 shadow-sm">
            <div className="w-12 h-12 bg-zinc-100 rounded-full" />
            <div className="h-4 w-16 bg-zinc-100 rounded-full" />
            <div className="h-6 w-24 bg-zinc-100 rounded-full mt-1" />
          </div>
        ))}
      </div>

      <div className="px-5 mt-8">
        <div className="h-6 w-40 bg-zinc-200 rounded-full mb-4" />
        <div className="space-y-3">
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
    </div>
  )
}
