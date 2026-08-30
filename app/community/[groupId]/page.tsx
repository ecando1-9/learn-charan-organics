import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGroupMessages, getGroupMembers } from "@/app/actions/community";
import { MessageBubble } from "@/components/community/message-bubble";
import { MessageInput } from "@/components/community/message-input";
import { MemberList } from "@/components/community/member-list";

interface Props {
  params: Promise<{ groupId: string }>;
}

export default async function GroupPage({ params }: Props) {
  const { groupId } = await params;
  const supabase = await createClient();

  // Get group info
  const { data: group } = await supabase
    .from("lms_groups")
    .select("*")
    .eq("id", groupId)
    .single();

  if (!group) notFound();

  // Get current user and role
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const currentUserId = user?.id ?? "";
  const { data: profile } = await supabase.from("lms_profiles").select("role").eq("id", currentUserId).single();
  const isAdmin = profile?.role === "admin";

  const [messages, members] = await Promise.all([
    getGroupMessages(groupId),
    getGroupMembers(groupId),
  ]);

  return (
    <>
      {/* Header */}
      <div className="border-b border-forest/10 bg-white dark:bg-transparent px-4 py-3 sm:px-6 sm:py-4 dark:border-white/10 flex items-center justify-between shrink-0 shadow-sm z-10 relative">
        <div className="flex items-center gap-3">
          {/* Mobile Back Button (Handled by a standard link back to /community) */}
          <a href="/community" className="lg:hidden text-leaf hover:bg-forest/5 p-2 -ml-2 rounded-full">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </a>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-forest dark:text-cream leading-tight">
              {group.name}
            </h1>
            {group.description && (
              <p className="text-xs sm:text-sm text-ink/60 dark:text-cream/60 truncate max-w-[200px] sm:max-w-md">
                {group.description}
              </p>
            )}
          </div>
        </div>
        <div className="text-xs font-bold text-leaf bg-leaf/10 px-3 py-1.5 rounded-full">
          {members.length} members
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 px-4 py-6 sm:px-6 bg-[#f0f2f5] dark:bg-transparent relative">
        {/* Subtle WhatsApp-style background pattern could go here */}
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="bg-white/80 dark:bg-white/5 backdrop-blur px-4 py-2 rounded-full shadow-sm text-sm text-ink/60 dark:text-cream/60 font-medium">
              No messages yet.
            </div>
          </div>
        ) : (
          messages.map((msg: any) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.user_id === currentUserId}
            />
          ))
        )}
      </div>

      {/* Message Input */}
      <div className="shrink-0 bg-[#f0f2f5] dark:bg-transparent pt-2">
        {isAdmin ? (
          <MessageInput groupId={groupId} />
        ) : (
          <div className="border-t border-forest/10 bg-white p-4 text-center dark:border-white/10 dark:bg-[#0e1f18]">
            <p className="text-sm font-medium text-ink/60 dark:text-cream/60">
              Only admins can send messages in this group.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
