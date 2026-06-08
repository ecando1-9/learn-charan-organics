import { Award, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CertificatesPage() {
  return <div><h1 className="text-3xl font-black text-forest dark:text-cream">Certificates</h1><div className="mt-6 rounded-[2rem] bg-white p-6 shadow-soft dark:bg-white/5"><Award className="text-leaf" size={42} /><h2 className="mt-4 text-xl font-black">No certificates yet</h2><p className="mt-2 text-sm text-ink/60 dark:text-cream/60">Completed course certificates will appear here after Supabase progress data marks a course eligible.</p><Button className="mt-5" disabled><Download size={18} /> Download PDF</Button></div></div>;
}
