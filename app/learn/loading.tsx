export default function LearnLoading() {
  return (
    <div className="min-h-screen bg-[#07140f] text-cream flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="relative flex items-center justify-center">
        <div className="size-16 rounded-full border-4 border-leaf/30 border-t-leaf animate-spin" />
        <div className="absolute size-3 rounded-full bg-leaf animate-ping" />
      </div>
      <p className="text-base font-bold text-cream/90 animate-pulse">
        Loading classroom & video player…
      </p>
    </div>
  );
}
