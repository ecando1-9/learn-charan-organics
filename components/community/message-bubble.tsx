import { ExternalLink } from "lucide-react";
import type { GroupMessage } from "@/lib/types";

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

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageBubble({
  message,
  isOwn,
}: {
  message: GroupMessage;
  isOwn: boolean;
}) {
  const name = message.profile?.full_name ?? null;
  const email = message.profile?.email ?? "";
  const initials = getInitials(name, email);

  return (
    <div className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
      <span
        className={`grid size-9 shrink-0 place-items-center rounded-full text-sm font-black text-white ${
          isOwn ? "bg-leaf" : "bg-forest"
        }`}
      >
        {initials}
      </span>
      <div
        className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col gap-1`}
      >
        <div
          className={`flex items-center gap-2 text-xs text-ink/50 dark:text-cream/50 ${isOwn ? "flex-row-reverse" : ""}`}
        >
          <span className="font-bold">{name ?? email}</span>
          <span>{formatTime(message.created_at)}</span>
        </div>
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${
            isOwn
              ? "rounded-tr-sm bg-leaf text-white"
              : "rounded-tl-sm bg-white text-ink shadow-sm dark:bg-white/10 dark:text-cream"
          }`}
        >
          {message.body}
        </div>
        {message.resource_link && (
          <a
            href={message.resource_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-xl bg-white/80 px-3 py-1.5 text-xs font-bold text-leaf shadow-sm hover:bg-white dark:bg-white/10 dark:hover:bg-white/20"
          >
            <ExternalLink size={11} /> Shared Resource
          </a>
        )}
      </div>
    </div>
  );
}
