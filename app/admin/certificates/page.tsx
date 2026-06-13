import { Award, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const certificateRequests = [
  { student: "Pending student", nameOnCertificate: "Student Name", course: "Diploma in Herbal Cosmetic Product Making", watched: "0 / 24 videos", status: "Pending" }
];

export default function AdminCertificatesPage() {
  return (
    <div>
      <h1 className="text-3xl font-black text-forest dark:text-cream">Certificate Requests</h1>
      <p className="mt-2 text-sm text-ink/60 dark:text-cream/60">Students request certificates with their name. Admin approves after checking enrollment, video progress and completion.</p>
      <div className="mt-6 grid gap-4">
        {certificateRequests.map((request) => (
          <div key={request.nameOnCertificate} className="grid gap-4 rounded-[2rem] bg-white p-5 shadow-soft lg:grid-cols-[1fr_auto] lg:items-center dark:bg-white/5">
            <div>
              <Award className="text-leaf" />
              <h2 className="mt-3 text-xl font-black text-forest dark:text-cream">{request.nameOnCertificate}</h2>
              <p className="mt-1 text-sm text-ink/60 dark:text-cream/60">{request.course}</p>
              <p className="mt-3 text-sm font-semibold">Watched: {request.watched}</p>
            </div>
            <div className="flex gap-2">
              <Button><CheckCircle2 size={18} /> Release certificate</Button>
              <Button variant="secondary"><XCircle size={18} /> Reject</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
