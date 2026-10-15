export default function CoursesLoading() {
  return (
    <div className="min-h-screen bg-linen dark:bg-[#07140f] py-10 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <div className="size-6 rounded-full border-2 border-leaf/30 border-t-leaf animate-spin" />
            <span className="text-xs font-black uppercase tracking-wider text-leaf">Loading Catalog</span>
          </div>
          <div className="h-10 w-64 mx-auto rounded-2xl bg-black/5 dark:bg-white/5 animate-pulse" />
        </div>

        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-3xl border border-forest/10 bg-white dark:bg-white/5 p-4 shadow-soft space-y-4 animate-pulse"
            >
              <div className="aspect-[4/3] w-full rounded-2xl bg-black/5 dark:bg-white/10" />
              <div className="h-5 w-3/4 rounded-xl bg-black/5 dark:bg-white/10" />
              <div className="h-4 w-1/2 rounded-xl bg-black/5 dark:bg-white/10" />
              <div className="pt-2 border-t border-forest/5 flex justify-between items-center">
                <div className="h-6 w-16 rounded-lg bg-black/5 dark:bg-white/10" />
                <div className="h-8 w-24 rounded-full bg-black/5 dark:bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
