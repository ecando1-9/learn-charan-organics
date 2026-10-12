import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGroupMessages, getGroupMembers } from "@/app/actions/community";
import { MessageInput } from "@/components/community/message-input";
import { RealtimeMessages } from "@/components/community/realtime-messages";
import { GroupHeaderInfo } from "@/components/community/group-header-info";
import { Lock, ShieldCheck } from "lucide-react";
import { checkUserIsAdmin } from "@/lib/supabase/profile";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ groupId: string }>;
}

export default async function GroupPage({ params }: Props) {
  const { groupId } = await params;
  const supabase = await createClient();

  // 1. Fetch group cleanly by ID, slug, or slugified group name
  const isUuid = /^[0-9a-fA-F-]{36}$/.test(groupId);
  let group: any = null;

  if (isUuid) {
    const { data } = await supabase
      .from("lms_groups")
      .select("*")
      .eq("id", groupId)
      .maybeSingle();
    group = data;
  }

  if (!group) {
    const { data: allGroups } = await supabase
      .from("lms_groups")
      .select("*")
      .order("created_at", { ascending: false });

    const slugifiedId = groupId.toLowerCase();
    group = (allGroups ?? []).find((g: any) => {
      const gSlug = (g.slug || g.name || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      return (
        g.id === groupId ||
        gSlug === slugifiedId ||
        (slugifiedId.includes("announcement") && g.name.toLowerCase().includes("announcement"))
      );
    }) || allGroups?.[0];
  }

  if (!group) notFound();

  // Get current user and role reliably
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const currentUserId = user?.id ?? "";
  const isAdmin = user ? await checkUserIsAdmin(user.id, user.email) : false;

  const [messages, members] = await Promise.all([
    getGroupMessages(group.id),
    getGroupMembers(group.id),
  ]);

  const isMember = members.some((m: any) => m.user_id === currentUserId || m.profile?.id === currentUserId);
  const isAdminOnlyMode = group.admin_only_messaging ?? false;
  const canSend = isAdmin || (isMember && !isAdminOnlyMode);

  return (
    <div className="flex h-full flex-col bg-[#efeae2] dark:bg-[#0b141a] relative overflow-hidden">
      {/* WhatsApp Header Bar */}
      <GroupHeaderInfo
        group={group}
        members={members}
        isAdmin={isAdmin}
        currentUserId={currentUserId}
      />

      {/* Admin Capability Banner — only visible to admins */}
      {isAdmin && (
        <div className="shrink-0 flex items-center justify-between gap-2 px-3 sm:px-4 py-1.5 bg-emerald-700/10 dark:bg-emerald-900/30 border-b border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold overflow-hidden">
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <ShieldCheck size={13} className="shrink-0" />
            <span className="truncate">Admin: Send messages, add members &amp; share files</span>
          </div>
          {group.admin_only_messaging && (
            <span className="shrink-0 flex items-center gap-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 text-[10px]">
              <Lock size={10} /> <span className="hidden sm:inline">Announcement</span>
            </span>
          )}
        </div>
      )}

      {/* Messages Feed */}
      <RealtimeMessages
        groupId={group.id}
        initialMessages={messages}
        currentUserId={currentUserId}
      />

      {/* WhatsApp Input Footer */}
      <div className="shrink-0 bg-[#f0f2f5] dark:bg-[#111b21]">
        {canSend ? (
          <MessageInput groupId={group.id} />
        ) : (
          <div className="border-t border-gray-200 p-4 text-center dark:border-white/10 dark:bg-[#111b21]">
            <p className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1.5">
              <Lock size={15} /> Only admins can send messages in this group.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
