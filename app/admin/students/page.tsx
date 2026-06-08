import { Search } from "lucide-react";

const students = ["Priya S", "Ramesh K", "Aisha M", "Divya P", "Karthik R"];

export default function AdminStudentsPage() {
  return <div><h1 className="text-3xl font-black text-forest dark:text-cream">Student Management</h1><label className="mt-5 flex max-w-xl items-center gap-3 rounded-full bg-white px-4 py-3 shadow-soft dark:bg-white/5"><Search size={18} /><input className="w-full bg-transparent outline-none" placeholder="Search students" /></label><div className="mt-6 grid gap-3">{students.map((student, index) => <div key={student} className="grid gap-3 rounded-[1.5rem] bg-white p-4 shadow-soft sm:grid-cols-[1fr_auto_auto] sm:items-center dark:bg-white/5"><div><h2 className="font-black">{student}</h2><p className="text-sm text-ink/60 dark:text-cream/60">{index + 1} enrolled courses • {38 + index * 9}% avg progress</p></div><span className="rounded-full bg-leaf/10 px-3 py-1 text-xs font-black text-leaf">Active</span><button className="rounded-full bg-forest px-4 py-2 text-sm font-bold text-white">Manage access</button></div>)}</div></div>;
}
