import Image from "next/image";
import Link from "next/link";
import { Clock, IndianRupee, Signal, Star, Users } from "lucide-react";
import type { Course } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link href={`/courses/${course.slug}`} className="group overflow-hidden rounded-[2rem] border border-forest/10 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-glass dark:border-white/10 dark:bg-white/5">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image src={course.thumbnail} alt={course.title} fill className="object-cover transition duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
        <span className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-forest backdrop-blur">{course.category}</span>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <h3 className="line-clamp-2 text-lg font-bold text-forest dark:text-cream">{course.title}</h3>
          <p className="mt-1 text-sm text-ink/60 dark:text-cream/60">By {course.instructor}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-ink/65 dark:text-cream/65">
          <span className="flex items-center gap-1"><Star size={14} className="fill-clay text-clay" /> {course.rating}</span>
          <span className="flex items-center gap-1"><Users size={14} /> {course.students.toLocaleString()}</span>
          <span className="flex items-center gap-1"><Clock size={14} /> {course.duration}</span>
          <span className="flex items-center gap-1"><Signal size={14} /> {course.level}</span>
        </div>
        <div className="flex items-center justify-between border-t border-forest/10 pt-4">
          <span className="text-lg font-black text-forest dark:text-cream">{formatCurrency(course.price)}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-leaf/10 px-3 py-1 text-xs font-bold text-leaf"><IndianRupee size={13} /> Enroll</span>
        </div>
      </div>
    </Link>
  );
}
