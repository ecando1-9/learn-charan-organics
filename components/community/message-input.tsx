"use client";

import { FormEvent, useState, useTransition } from "react";
import { Link2, Send } from "lucide-react";
import { sendGroupMessage } from "@/app/actions/community";

export function MessageInput({ groupId }: { groupId: string }) {
  const [body, setBody] = useState("");
  const [link, setLink] = useState("");
  const [showLink, setShowLink] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await sendGroupMessage(groupId, body, link || undefined);
      if (result.error) {
        setError(result.error);
      } else {
        setBody("");
        setLink("");
        setShowLink(false);
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-forest/10 bg-white p-4 dark:border-white/10 dark:bg-white/5"
    >
      {error && (
        <p className="mb-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}
      {showLink && (
        <div className="mb-2">
          <input
            type="url"
            placeholder="Paste a resource or meeting link (optional)"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="w-full rounded-2xl border border-forest/20 bg-linen px-4 py-2 text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-leaf dark:border-white/10 dark:bg-white/5 dark:text-cream"
          />
        </div>
      )}
      <div className="flex items-end gap-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e as any);
            }
          }}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 resize-none rounded-2xl border border-forest/20 bg-linen px-4 py-3 text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-leaf dark:border-white/10 dark:bg-white/5 dark:text-cream"
        />
        <button
          type="button"
          onClick={() => setShowLink(!showLink)}
          className="grid size-11 place-items-center rounded-full bg-forest/5 text-forest transition hover:bg-forest/10 dark:bg-white/10 dark:text-cream"
          title="Share a resource link"
        >
          <Link2 size={18} />
        </button>
        <button
          type="submit"
          disabled={isPending || !body.trim()}
          className="grid size-11 place-items-center rounded-full bg-leaf text-white transition hover:bg-forest disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>
    </form>
  );
}
