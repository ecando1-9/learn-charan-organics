"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Bell, CheckCheck, MessageSquare, BookOpen, Sparkles, X, ChevronRight } from "lucide-react";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  LMSNotification,
} from "@/app/actions/notifications";

function getRelativeTime(dateStr: string) {
  try {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch {
    return "";
  }
}

export function NotificationsPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<LMSNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  useEffect(() => {
    loadNotifications();
  }, []);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function loadNotifications() {
    setLoading(true);
    const res = await getUserNotifications();
    setNotifications(res);
    setLoading(false);
  }

  async function handleMarkRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    );
    await markNotificationAsRead(id);
  }

  async function handleMarkAllRead() {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
    );
    await markAllNotificationsAsRead();
  }

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative grid size-10 place-items-center rounded-full bg-forest/5 text-ink/75 hover:bg-forest/10 hover:text-forest dark:bg-white/10 dark:text-cream/80 dark:hover:bg-white/20 transition shadow-sm"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-md animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-black/10 dark:bg-[#0e1f18] dark:ring-white/10 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
            <div className="flex items-center gap-2">
              <h4 className="font-black text-forest dark:text-cream text-sm flex items-center gap-1.5">
                Notifications
              </h4>
              {unreadCount > 0 && (
                <span className="rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px] font-extrabold px-2 py-0.5">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="mt-2 max-h-80 overflow-y-auto space-y-2 pr-1 divide-y divide-gray-100 dark:divide-white/5">
            {loading ? (
              <p className="text-xs text-gray-400 text-center py-6">Loading notifications...</p>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <Bell size={28} className="mx-auto text-gray-300 dark:text-cream/20" />
                <p className="text-xs font-bold text-gray-500 dark:text-cream/50">
                  No notifications yet!
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const isUnread = !n.read_at;
                return (
                  <div
                    key={n.id}
                    onClick={() => handleMarkRead(n.id)}
                    className={`pt-2.5 pb-2 px-2.5 rounded-xl transition cursor-pointer flex items-start gap-3 ${
                      isUnread
                        ? "bg-emerald-500/5 dark:bg-emerald-500/10 border-l-2 border-emerald-500"
                        : "hover:bg-gray-50 dark:hover:bg-white/5"
                    }`}
                  >
                    <div className="grid size-8 place-items-center rounded-full bg-emerald-700/10 text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-300 shrink-0 mt-0.5">
                      {n.link?.includes("community") ? (
                        <MessageSquare size={14} />
                      ) : n.link?.includes("courses") ? (
                        <BookOpen size={14} />
                      ) : (
                        <Sparkles size={14} />
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-black text-gray-900 dark:text-cream truncate">
                          {n.title}
                        </p>
                        <span className="text-[10px] text-gray-400 dark:text-cream/40 shrink-0">
                          {getRelativeTime(n.created_at)}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 dark:text-cream/70 mt-0.5 line-clamp-2 leading-relaxed">
                        {n.body}
                      </p>
                      {n.link && (
                        <Link
                          href={n.link}
                          onClick={() => setIsOpen(false)}
                          className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          View details <ChevronRight size={10} />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-white/10 text-center">
            <Link
              href="/community"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              Go to Community Chat & Announcements
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
