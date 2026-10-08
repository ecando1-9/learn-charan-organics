"use client";

import { useState } from "react";
import { Search, ShieldAlert, Filter, Clock, User, ChevronDown } from "lucide-react";

export function AdminLogsViewer({ logs }: { logs: any[] }) {
  const [query, setQuery] = useState("");
  const [filterAction, setFilterAction] = useState("all");

  const actionTypes = Array.from(new Set(logs.map((l) => l.action))).sort();

  const filteredLogs = logs.filter((log) => {
    const matchesQuery =
      log.user_email?.toLowerCase().includes(query.toLowerCase()) ||
      log.action?.toLowerCase().includes(query.toLowerCase()) ||
      JSON.stringify(log.details ?? {}).toLowerCase().includes(query.toLowerCase());

    const matchesAction = filterAction === "all" || log.action === filterAction;
    return matchesQuery && matchesAction;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40 dark:text-cream/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search logs by email, action, or details..."
            className="w-full rounded-2xl border border-forest/15 bg-white py-2.5 pl-10 pr-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-leaf dark:border-white/15 dark:bg-white/5 dark:text-cream"
          />
        </div>

        <div className="relative w-full sm:w-64">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="w-full appearance-none rounded-2xl border border-forest/15 bg-white py-2.5 pl-4 pr-10 text-sm font-semibold outline-none focus:ring-2 focus:ring-leaf dark:border-white/15 dark:bg-white/5 dark:text-cream"
          >
            <option value="all">All Event Types ({logs.length})</option>
            {actionTypes.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/40 dark:text-cream/40" />
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-[2rem] bg-white shadow-soft dark:bg-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-forest/10 dark:border-white/10 text-xs uppercase text-ink/50 dark:text-cream/50 bg-linen/50 dark:bg-white/5">
              <tr>
                <th className="py-3 px-5">Timestamp</th>
                <th className="py-3 px-5">User</th>
                <th className="py-3 px-5">Event Action</th>
                <th className="py-3 px-5">Event Payload / Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest/5 dark:divide-white/5 font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-ink/50 dark:text-cream/50">
                    No logs matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isVideo = log.action?.includes("video");
                  const isCourse = log.action?.includes("course");
                  const isGroup = log.action?.includes("group") || log.action?.includes("message");

                  return (
                    <tr key={log.id} className="hover:bg-linen/40 dark:hover:bg-white/5 transition">
                      <td className="py-3.5 px-5 text-xs text-ink/60 dark:text-cream/60 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Clock size={13} className="text-leaf" />
                          {new Date(log.created_at).toLocaleString([], {
                            dateStyle: "short",
                            timeStyle: "medium",
                          })}
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <div className="grid size-7 place-items-center rounded-full bg-forest/10 dark:bg-white/10 text-forest dark:text-cream text-xs font-bold">
                            <User size={12} />
                          </div>
                          <span className="text-xs font-bold text-forest dark:text-cream">
                            {log.user_email || "Anonymous"}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ${
                          isVideo
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            : isCourse
                            ? "bg-leaf/15 text-leaf border border-leaf/20"
                            : isGroup
                            ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                            : "bg-forest/10 text-forest dark:bg-white/10 dark:text-cream"
                        }`}>
                          {log.action}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-xs font-mono text-ink/75 dark:text-cream/75 max-w-md truncate">
                        {log.details ? JSON.stringify(log.details) : "{}"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
