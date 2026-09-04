export default function Loading() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-zinc-50 pb-24 animate-pulse">
      {/* Search Header Skeleton */}
      <div className="bg-zinc-800 px-6 pt-10 pb-8 rounded-b-[2.5rem]">
        <div className="h-8 w-8 bg-zinc-700 rounded-full mb-6" />
        <div className="h-16 w-full bg-zinc-700 rounded-2xl mb-4" />
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-10 bg-zinc-700 rounded-xl" />
          ))}
        </div>
      </div>

      <div className="px-5 mt-6 space-y-3">
        {[1, 2, 3, 4].map((i) => (
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
