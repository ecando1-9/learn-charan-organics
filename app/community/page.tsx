import { MessageCircle } from "lucide-react";

export default function CommunityPage() {
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
