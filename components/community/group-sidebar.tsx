"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users2, Search, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function GroupSidebar({ groups, isAdmin }: { groups: any[]; isAdmin?: boolean }) {
  const pathname = usePathname();
  // If the pathname is exactly "/community", we are on the index page (no chat selected).
  const isIndex = pathname === "/community";

  return (
    <div className={cn(
      "w-full lg:w-[340px] shrink-0 border-r border-forest/10 dark:border-white/10 flex flex-col bg-[#f7f3ea] dark:bg-white/5",
      !isIndex && "hidden lg:flex" // Hide on mobile if a chat is active
    )}>
      <div className="p-4 border-b border-forest/10 dark:border-white/10">
         <div className="flex items-center justify-between">
           <h2 className="text-xl font-black text-forest dark:text-cream flex items-center gap-2">
              <Users2 className="text-leaf" size={20} /> Community Chats
           </h2>
           {isAdmin && (
             <Link href="/admin/community" title="Manage Groups" className="grid size-8 place-items-center rounded-full bg-leaf/10 text-leaf hover:bg-leaf/20 transition">
               <Plus size={18} />
             </Link>
           )}
         </div>
         <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 dark:text-cream/40" size={16} />
            <input type="text" placeholder="Search groups..." className="w-full bg-white dark:bg-white/10 rounded-full py-2 pl-9 pr-4 text-sm font-medium outline-none focus:ring-2 ring-leaf text-ink dark:text-cream border border-forest/10 dark:border-transparent placeholder:text-ink/40" />
         </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {groups.length === 0 ? (
          <div className="p-8 text-center text-ink/50 dark:text-cream/50 text-sm font-medium">
             You haven't been added to any groups yet.
          </div>
        ) : (
          groups.map(group => {
            const isActive = pathname === `/community/${group.id}`;
            return (
              <Link 
                href={`/community/${group.id}`} 
                key={group.id}
                className={cn(
                  "flex items-center gap-3 p-4 border-b border-forest/5 dark:border-white/5 transition hover:bg-white dark:hover:bg-white/10",
                  isActive && "bg-white dark:bg-white/10 border-l-4 border-l-leaf"
                )}
              >
                 <div className="grid size-12 shrink-0 place-items-center rounded-full bg-forest text-cream font-bold shadow-sm text-sm">
                    {group.name.substring(0, 2).toUpperCase()}
                 </div>
                 <div className="flex-1 overflow-hidden">
                    <div className="font-bold text-forest dark:text-cream truncate text-sm">{group.name}</div>
                    <div className="text-xs text-ink/50 dark:text-cream/50 truncate mt-1">{group.description || "Tap to open chat..."}</div>
                 </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
