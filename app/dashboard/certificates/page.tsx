"use client";

import { useState } from "react";
import { Award, Download, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CertificatesPage() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Certificate request ready. Admin approval will enable the download button after progress review.");
  }

  return (
    <div>
      <h1 className="text-3xl font-black text-forest dark:text-cream">Certificates</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="rounded-[2rem] bg-white p-6 shadow-soft dark:bg-white/5">
          <Award className="text-leaf" size={42} />
          <h2 className="mt-4 text-xl font-black">Request certificate</h2>
          <p className="mt-2 text-sm text-ink/60 dark:text-cream/60">Enter the name to print on your certificate. Admin will approve after checking enrollment and video completion.</p>
          <input value={name} onChange={(event) => setName(event.target.value)} className="mt-5 w-full rounded-2xl bg-linen p-4 outline-none dark:bg-white/10" placeholder="Name for certificate" required />
          <Button className="mt-4"><Send size={18} /> Send request</Button>
          {message && <p className="mt-4 rounded-2xl bg-linen p-3 text-sm font-semibold text-forest dark:bg-white/10 dark:text-cream">{message}</p>}
        </form>
        <div className="rounded-[2rem] bg-white p-6 shadow-soft dark:bg-white/5">
          <h2 className="text-xl font-black">Approved certificates</h2>
          <p className="mt-2 text-sm text-ink/60 dark:text-cream/60">Download will be enabled when admin releases your certificate.</p>
          <Button className="mt-5" disabled><Download size={18} /> Download PDF</Button>
        </div>
      </div>
    </div>
  );
}
