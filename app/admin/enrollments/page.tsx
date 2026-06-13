import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const requests = [
  { student: "Pending student", email: "student@example.com", course: "Diploma in Herbal Cosmetic Product Making", amount: "Rs. 10,000", status: "Pending" }
];

export default function AdminEnrollmentsPage() {
  return (
    <div>
      <h1 className="text-3xl font-black text-forest dark:text-cream">Enrollment Requests</h1>
      <p className="mt-2 text-sm text-ink/60 dark:text-cream/60">Students pay by UPI, request access, and admin approves or rejects enrollment.</p>
      <div className="mt-6 grid gap-4">
        {requests.map((request) => (
          <div key={request.email} className="grid gap-4 rounded-[2rem] bg-white p-5 shadow-soft lg:grid-cols-[1fr_auto] lg:items-center dark:bg-white/5">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-clay/10 px-3 py-1 text-xs font-black text-clay"><Clock size={14} /> {request.status}</span>
              <h2 className="mt-3 text-xl font-black text-forest dark:text-cream">{request.student}</h2>
              <p className="mt-1 text-sm text-ink/60 dark:text-cream/60">{request.email}</p>
              <p className="mt-3 text-sm font-semibold">{request.course} - {request.amount}</p>
              <p className="mt-2 text-xs text-ink/55 dark:text-cream/55">Approval should create/update lms_enrollments and unlock protected course video access.</p>
            </div>
            <div className="flex gap-2">
              <Button><CheckCircle2 size={18} /> Approve</Button>
              <Button variant="secondary"><XCircle size={18} /> Reject</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
