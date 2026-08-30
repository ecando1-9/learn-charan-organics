import { Users } from "lucide-react";
import type { GroupMember } from "@/lib/types";

function getInitials(name: string | null, email: string): string {
  if (name)
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  return email[0].toUpperCase();
}

export function MemberList({ members }: { members: GroupMember[] }) {
  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5">
      <h3 className="flex items-center gap-2 font-black text-forest dark:text-cream">
        <Users size={18} className="text-leaf" /> Members ({members.length})
      </h3>
      <div className="mt-4 grid gap-3">
        {members.map((m) => {
          const name = m.profile?.full_name ?? null;
          const email = m.profile?.email ?? "";
          const initials = getInitials(name, email);
          return (
            <div key={m.id} className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-forest text-sm font-black text-white dark:bg-leaf">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-forest dark:text-cream">
                  {name ?? email}
                </p>
                {name && (
                  <p className="truncate text-xs text-ink/50 dark:text-cream/50">
                    {email}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        {members.length === 0 && (
          <p className="text-sm text-ink/50 dark:text-cream/50">
            No members yet.
          </p>
        )}
      </div>
    </div>
  );
}
