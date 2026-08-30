import Link from "next/link";
import { Users } from "lucide-react";
import type { Group } from "@/lib/types";

export function GroupCard({ group }: { group: Group }) {
  return (
    <Link
      href={`/community/${group.id}`}
      className="block rounded-[2rem] bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-md dark:bg-white/5"
    >
      {group.cover_image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={group.cover_image_url}
          alt={group.name}
          className="mb-4 h-32 w-full rounded-2xl object-cover"
        />
      ) : (
        <div className="mb-4 flex h-32 items-center justify-center rounded-2xl bg-leaf/10">
          <Users size={36} className="text-leaf" />
        </div>
      )}
      <h3 className="font-black text-forest dark:text-cream">{group.name}</h3>
      {group.description && (
        <p className="mt-1 text-sm leading-6 text-ink/60 line-clamp-2 dark:text-cream/60">
          {group.description}
        </p>
      )}
      <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-leaf/10 px-3 py-1 text-xs font-bold text-leaf">
        <Users size={12} /> Open Group
      </span>
    </Link>
  );
}
