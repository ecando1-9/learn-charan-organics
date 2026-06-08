import { testimonials } from "@/lib/data";
import { Section } from "@/components/ui/section";

export default function TestimonialsPage() {
  return <Section><h1 className="text-4xl font-black text-forest dark:text-cream">Student Testimonials</h1><div className="mt-8 grid gap-6 md:grid-cols-3">{testimonials.map((item) => <div key={item.name} className="rounded-[2rem] bg-white p-6 shadow-soft dark:bg-white/5"><p className="leading-7">"{item.quote}"</p><b className="mt-5 block">{item.name}</b><span className="text-sm text-ink/60 dark:text-cream/60">{item.role}</span></div>)}</div></Section>;
}
