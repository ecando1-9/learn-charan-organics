import { redirect } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { getMyGroups } from "@/app/actions/community";

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ list?: string }>;
}) {
  const { list } = (await searchParams) || {};
  const { groups } = await getMyGroups();

  // If user opens community normally, default focus directly on the first (most recent) group!
  if (!list && groups && groups.length > 0) {
    const topGroup = groups[0].slug || groups[0].id;
    redirect(`/community/${topGroup}`);
  }

  return (
    <div className="hidden lg:flex h-full flex-col items-center justify-center text-center p-8 bg-white dark:bg-transparent">
       <div className="grid size-24 place-items-center rounded-full bg-forest/5 dark:bg-white/5 text-leaf mb-6">
         <MessageCircle size={40} />
       </div>
       <h2 className="text-2xl font-black text-forest dark:text-cream">Your Community Chats</h2>
       <p className="mt-3 text-ink/60 dark:text-cream/60 max-w-sm">
         Select a group from the sidebar to view messages, share resources, and connect with other makers.
       </p>
    </div>
  );
}
