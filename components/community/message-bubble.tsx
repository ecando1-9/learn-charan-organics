"use client";

import { ExternalLink, FileText, Download, CheckCheck } from "lucide-react";
import type { GroupMessage } from "@/lib/types";

function getInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length > 0) {
      return parts
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }
  }
  if (email && email.trim()) {
    return email.trim()[0].toUpperCase();
  }
  return "?";
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
}

function isImageFile(type?: string | null, url?: string | null): boolean {
  if (!url) return false;
  if (type?.startsWith("image/")) return true;
  return /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(url);
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
  const time = formatTime(message.created_at);
  const isImage = isImageFile(message.file_type, message.file_url);

  return (
    <div className={`flex gap-2.5 ${isOwn ? "flex-row-reverse" : "flex-row"} items-end`}>
      {/* Sender Avatar */}
      {!isOwn && (
        <span
          className="grid size-8 shrink-0 place-items-center rounded-full text-xs font-black text-white bg-emerald-700 shadow-sm"
          title={name ?? email}
        >
          {initials}
        </span>
      )}

      <div className={`max-w-[85%] sm:max-w-[70%] flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
        {/* Sender Name for received messages in group */}
        {!isOwn && (
          <span className="mb-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-400 px-1">
            {name ?? (email ? email.split("@")[0] : "Student")}
          </span>
        )}

        {/* WhatsApp Chat Bubble */}
        <div
          className={`relative rounded-2xl px-4 py-2.5 shadow-sm text-sm ${
            isOwn
              ? "rounded-tr-none bg-[#d9fdd3] text-gray-900 dark:bg-[#005c4b] dark:text-cream border border-emerald-200/50 dark:border-emerald-600/30"
              : "rounded-tl-none bg-white text-gray-900 dark:bg-[#202c33] dark:text-cream border border-gray-200/60 dark:border-white/5"
          }`}
        >
          {/* Attached Image Preview */}
          {message.file_url && isImage && (
            <div className="mb-2 overflow-hidden rounded-xl border border-black/10 dark:border-white/10 max-w-sm">
              <a href={message.file_url} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={message.file_url}
                  alt={message.file_name || "Attachment"}
                  className="w-full max-h-72 object-cover hover:scale-105 transition-transform duration-300"
                />
              </a>
            </div>
          )}

          {/* Attached Document File */}
          {message.file_url && !isImage && (
            <div className="mb-2 flex items-center gap-3 rounded-xl bg-black/5 p-3 dark:bg-white/10 border border-black/10 dark:border-white/10">
              <div className="grid size-10 place-items-center rounded-lg bg-emerald-600 text-white shrink-0">
                <FileText size={20} />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold truncate text-gray-900 dark:text-cream">
                  {message.file_name || "Document"}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-cream/60 uppercase">
                  {message.file_type?.split("/")[1] || "Attachment"}
                </p>
              </div>
              <a
                href={message.file_url}
                download={message.file_name || "download"}
                target="_blank"
                rel="noopener noreferrer"
                className="grid size-8 place-items-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition shrink-0"
                title="Download file"
              >
                <Download size={14} />
              </a>
            </div>
          )}

          {/* Text Body */}
          {message.body && (
            <p className="whitespace-pre-wrap leading-relaxed break-words font-medium">
              {message.body}
            </p>
          )}

          {/* External Resource Link */}
          {message.resource_link && (
            <a
              href={message.resource_link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600/10 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:underline dark:bg-emerald-400/10 dark:text-emerald-400"
            >
              <ExternalLink size={12} /> {message.resource_link}
            </a>
          )}

          {/* Timestamp & Double Ticks */}
          <div className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-60">
            <span>{time}</span>
            {isOwn && <CheckCheck size={14} className="text-emerald-600 dark:text-emerald-400" />}
          </div>
        </div>
      </div>
    </div>
  );
}
