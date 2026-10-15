export default function CourseDetailLoading() {
  return (
    <div className="min-h-screen bg-linen dark:bg-[#07140f] pb-20">
      {/* Top Banner / Buffering Indicator */}
      <div className="bg-forest dark:bg-[#0a1e16] text-cream py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            {/* Buffering Round Spinner */}
            <div className="relative flex items-center justify-center">
              <div className="size-14 sm:size-16 rounded-full border-4 border-leaf/30 border-t-leaf animate-spin" />
              <div className="absolute size-3 rounded-full bg-leaf animate-ping" />
            </div>
            <p className="text-sm sm:text-base font-bold text-cream/90 animate-pulse">
              Loading course details…
            </p>
          </div>
        </div>
      </div>

      {/* Skeleton Body */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-8 w-3/4 rounded-2xl bg-black/5 dark:bg-white/5 animate-pulse" />
            <div className="aspect-video w-full rounded-3xl bg-black/10 dark:bg-white/10 animate-pulse flex items-center justify-center">
              <div className="size-12 rounded-full border-4 border-forest/20 border-t-leaf animate-spin" />
            </div>
            <div className="space-y-3">
              <div className="h-4 w-full rounded-xl bg-black/5 dark:bg-white/5 animate-pulse" />
              <div className="h-4 w-5/6 rounded-xl bg-black/5 dark:bg-white/5 animate-pulse" />
              <div className="h-4 w-2/3 rounded-xl bg-black/5 dark:bg-white/5 animate-pulse" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-80 w-full rounded-3xl bg-white/80 dark:bg-white/5 p-6 border border-forest/10 dark:border-white/10 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
