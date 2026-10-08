"use client";

import { FormEvent, useState, useRef, useTransition } from "react";
import { Link2, Paperclip, Send, X, FileText, CheckCircle2 } from "lucide-react";
import { sendGroupMessage } from "@/app/actions/community";

/* ── Inline circular SVG progress indicator ── */
function CircularProgress({ progress, size = 44 }: { progress: number; size?: number }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth}
          className="text-black/10 dark:text-white/15 fill-none" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round"
          className="text-emerald-500 transition-all duration-200 fill-none" />
      </svg>
      <span className="absolute text-[10px] font-black text-emerald-700 dark:text-emerald-400">
        {Math.round(progress)}%
      </span>
    </div>
  );
}

export function MessageInput({ groupId }: { groupId: string }) {
  const [body, setBody] = useState("");
  const [link, setLink] = useState("");
  const [showLink, setShowLink] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Upload state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [attachment, setAttachment] = useState<{
    url: string;
    fileName: string;
    fileType: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setError("File size exceeds 15MB limit.");
      return;
    }

    setUploading(true);
    setUploadDone(false);
    setUploadProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    // Use XMLHttpRequest so we can track progress
    await new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const pct = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(pct);
        }
      });

      xhr.addEventListener("load", () => {
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            setAttachment({ url: data.url, fileName: data.fileName, fileType: data.fileType });
            setUploadProgress(100);
            setUploadDone(true);
          } else {
            setError(data.error || "Upload failed.");
          }
        } catch {
          setError("Upload failed — invalid server response.");
        }
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        resolve();
      });

      xhr.addEventListener("error", () => {
        setError("Upload failed — network error.");
        setUploading(false);
        resolve();
      });

      xhr.addEventListener("abort", () => {
        setError("Upload cancelled.");
        setUploading(false);
        resolve();
      });

      xhr.open("POST", "/api/community/upload");
      xhr.send(formData);
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!body.trim() && !attachment) return;
    setError(null);

    startTransition(async () => {
      const result = await sendGroupMessage(groupId, body, link || undefined, attachment || undefined);
      if (result.error) {
        setError(result.error);
      } else {
        setBody("");
        setLink("");
        setShowLink(false);
        setAttachment(null);
        setUploadProgress(0);
        setUploadDone(false);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}
      className="border-t border-gray-200/80 bg-[#f0f2f5] p-3 sm:p-4 dark:border-white/10 dark:bg-[#111b21]"
    >
      {error && (
        <p className="mb-2 rounded-xl bg-red-100 px-3 py-2 text-xs font-bold text-red-600 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Upload Progress Bar — shows during active upload */}
      {uploading && (
        <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-[#202c33] border border-emerald-500/20">
          <CircularProgress progress={uploadProgress} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-gray-900 dark:text-cream">Uploading file…</p>
            {/* Horizontal progress track */}
            <div className="mt-1.5 h-1.5 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="mt-0.5 text-[10px] text-ink/50 dark:text-cream/50">
              {uploadProgress}% uploaded — please wait
            </p>
          </div>
        </div>
      )}

      {/* Attachment Preview — shows after upload done */}
      {!uploading && attachment && (
        <div className="mb-3 flex items-center justify-between rounded-xl bg-white p-2.5 shadow-sm dark:bg-[#202c33] border border-emerald-500/20">
          <div className="flex items-center gap-2 overflow-hidden">
            {attachment.fileType.startsWith("image/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={attachment.url} alt="Preview" className="size-10 rounded-lg object-cover border" />
            ) : (
              <div className="grid size-10 place-items-center rounded-lg bg-emerald-600 text-white shrink-0">
                <FileText size={20} />
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-gray-900 truncate dark:text-cream">
                {attachment.fileName}
              </p>
              <p className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 size={10} /> Ready to send
              </p>
            </div>
          </div>
          <button type="button" onClick={() => { setAttachment(null); setUploadProgress(0); setUploadDone(false); }}
            className="grid size-7 place-items-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-white/10">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Optional Link Input */}
      {showLink && (
        <div className="mb-2">
          <input type="url" placeholder="Paste a resource or meeting link (optional)..."
            value={link} onChange={(e) => setLink(e.target.value)}
            className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:border-white/10 dark:bg-[#2a3942] dark:text-cream"
          />
        </div>
      )}

      {/* Hidden File Input */}
      <input type="file" ref={fileInputRef} onChange={handleFileSelect}
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip" className="hidden" />

      <div className="flex items-end gap-2">
        {/* Attach Button — shows circular ring progress while uploading */}
        <button type="button" onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="relative grid size-11 place-items-center rounded-full bg-white text-gray-600 shadow-sm transition hover:bg-emerald-50 hover:text-emerald-600 dark:bg-[#202c33] dark:text-cream/80 dark:hover:bg-white/10 shrink-0 disabled:opacity-70"
          title="Attach photo or document"
        >
          {uploading ? (
            <CircularProgress progress={uploadProgress} size={44} />
          ) : uploadDone ? (
            <CheckCircle2 size={18} className="text-emerald-600" />
          ) : (
            <Paperclip size={18} />
          )}
        </button>

        {/* Link Button */}
        <button type="button" onClick={() => setShowLink(!showLink)}
          className={`grid size-11 place-items-center rounded-full bg-white shadow-sm transition shrink-0 ${
            showLink ? "bg-emerald-600 text-white dark:bg-emerald-600" : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-[#202c33] dark:text-cream/80 dark:hover:bg-white/10"
          }`}
          title="Share a web link"
        >
          <Link2 size={18} />
        </button>

        {/* Text Input */}
        <textarea value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e as any);
            }
          }}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 resize-none rounded-2xl border border-gray-300 bg-white px-3.5 py-2.5 sm:px-4 sm:py-3 text-base sm:text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:border-white/10 dark:bg-[#2a3942] dark:text-cream dark:placeholder:text-cream/40 shadow-sm"
        />

        {/* Send Button */}
        <button type="submit"
          disabled={isPending || uploading || (!body.trim() && !attachment)}
          className="grid size-11 place-items-center rounded-full bg-emerald-600 text-white shadow-md transition hover:bg-emerald-700 disabled:opacity-50 shrink-0"
          title="Send message"
        >
          {isPending
            ? <CircularProgress progress={60} size={44} />
            : <Send size={18} />}
        </button>
      </div>
    </form>
  );
}
