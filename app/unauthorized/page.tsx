import Link from "next/link";
import { Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07140f] text-cream px-6">
      <div className="max-w-md w-full text-center space-y-6 rounded-[2.5rem] bg-white/5 border border-white/10 p-8 sm:p-10 backdrop-blur-xl">
        <div className="mx-auto grid size-20 place-items-center rounded-[2rem] bg-clay/10 text-clay border border-clay/20">
          <Lock size={36} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-cream tracking-tight">Access Denied</h1>
          <p className="text-sm text-cream/70 leading-relaxed">
            You do not have access to this premium lesson. This course requires an active enrollment.
          </p>
        </div>

        <div className="border-t border-white/10 my-6" />

        <div className="grid gap-3">
          <Link href="/courses" className="w-full">
            <Button className="w-full bg-leaf hover:bg-moss text-white rounded-full py-3 font-bold transition active:scale-95">
              Explore Courses
            </Button>
          </Link>
          
          <Link href="/" className="w-full">
            <Button variant="secondary" className="w-full border border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-full py-3 font-bold transition active:scale-95">
              <ArrowLeft size={16} className="inline mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
