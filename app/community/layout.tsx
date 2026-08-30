import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getMyGroups } from "@/app/actions/community";
import { GroupSidebar } from "@/components/community/group-sidebar";
import { ChatAreaWrapper } from "@/components/community/chat-area-wrapper";

export default async function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { groups, isAdmin } = await getMyGroups();

  return (
    <DashboardShell>
      <div className="flex h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)] overflow-hidden rounded-[2rem] bg-linen shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10">
         {/* Group Sidebar */}
         <GroupSidebar groups={groups} isAdmin={isAdmin} />
         
         {/* Chat Area / Children */}
         <ChatAreaWrapper>
            {children}
         </ChatAreaWrapper>
      </div>
    </DashboardShell>
  );
}
