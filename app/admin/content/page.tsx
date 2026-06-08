export default function AdminContentPage() {
  return <AdminList title="Content Management" items={["Homepage banners", "Featured courses", "Testimonials", "FAQ section", "Blog posts", "Instructor profiles"]} />;
}

function AdminList({ title, items }: { title: string; items: string[] }) {
  return <div><h1 className="text-3xl font-black text-forest dark:text-cream">{title}</h1><div className="mt-6 grid gap-3">{items.map((item) => <div key={item} className="rounded-[1.5rem] bg-white p-5 font-bold shadow-soft dark:bg-white/5">{item}</div>)}</div></div>;
}
