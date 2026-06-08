import { Section } from "@/components/ui/section";

const posts = ["How to price handmade soap batches", "Beginner safety checklist for natural cosmetics", "Choosing packaging for herbal oils"];

export default function BlogPage() {
  return <Section><h1 className="text-4xl font-black text-forest dark:text-cream">Articles</h1><div className="mt-8 grid gap-5 md:grid-cols-3">{posts.map((post) => <article key={post} className="rounded-[2rem] bg-white p-6 shadow-soft dark:bg-white/5"><p className="text-sm font-bold text-leaf">Manufacturing Guide</p><h2 className="mt-3 text-xl font-black">{post}</h2><p className="mt-3 text-sm leading-6 text-ink/60 dark:text-cream/60">Practical tips for organic product makers and small-batch entrepreneurs.</p></article>)}</div></Section>;
}
