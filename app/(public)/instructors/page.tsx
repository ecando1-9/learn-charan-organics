import { Section } from "@/components/ui/section";

const instructors = ["Charan Organics Faculty", "Dr. Meera Iyer", "Arun Prakash", "Nisha Varma"];

export default function InstructorsPage() {
  return <Section><h1 className="text-4xl font-black text-forest dark:text-cream">Popular Instructors</h1><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{instructors.map((name) => <div key={name} className="glass rounded-[2rem] p-6"><div className="grid size-16 place-items-center rounded-full bg-leaf text-xl font-black text-white">{name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</div><h2 className="mt-4 font-black">{name}</h2><p className="mt-2 text-sm text-ink/60 dark:text-cream/60">Natural product formulation mentor</p></div>)}</div></Section>;
}
