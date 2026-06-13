"use client";

import { useState } from "react";
import { Search, Users, ShieldAlert, GraduationCap, UserMinus } from "lucide-react";

type Profile = {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  suspended: boolean;
  created_at: string;
  enrollment_count: number;
};

export function StudentsClient({ initialStudents }: { initialStudents: Profile[] }) {
  const [students] = useState<Profile[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "enrolled" | "not_enrolled">("all");

  // Stats
  const totalCount = students.length;
  const enrolledCount = students.filter((s) => s.enrollment_count > 0).length;
  const notEnrolledCount = students.filter((s) => s.enrollment_count === 0).length;

  // Filtering
  const filteredStudents = students.filter((student) => {
    const name = student.full_name?.toLowerCase() ?? "";
    const email = student.email.toLowerCase();
    const searchLower = search.toLowerCase();

    const matchesSearch = name.includes(searchLower) || email.includes(searchLower);

    if (filter === "enrolled") {
      return matchesSearch && student.enrollment_count > 0;
    }
    if (filter === "not_enrolled") {
      return matchesSearch && student.enrollment_count === 0;
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[2rem] bg-white p-6 shadow-soft dark:bg-white/5 flex items-center gap-4 border border-forest/5 dark:border-white/5">
          <div className="grid size-12 place-items-center rounded-2xl bg-forest/10 text-forest dark:text-cream">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-cream/50">Total Students</p>
            <p className="text-2xl font-black text-forest dark:text-cream">{totalCount}</p>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-soft dark:bg-white/5 flex items-center gap-4 border border-forest/5 dark:border-white/5">
          <div className="grid size-12 place-items-center rounded-2xl bg-leaf/10 text-leaf">
            <GraduationCap size={22} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-cream/50">Enrolled Students</p>
            <p className="text-2xl font-black text-forest dark:text-cream">{enrolledCount}</p>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-soft dark:bg-white/5 flex items-center gap-4 border border-forest/5 dark:border-white/5">
          <div className="grid size-12 place-items-center rounded-2xl bg-clay/10 text-clay">
            <UserMinus size={22} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-cream/50">Not Enrolled</p>
            <p className="text-2xl font-black text-forest dark:text-cream">{notEnrolledCount}</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <label className="flex flex-1 max-w-md items-center gap-3 rounded-full bg-white px-4 py-3 shadow-soft dark:bg-white/5 border border-forest/5 dark:border-white/5">
          <Search size={18} className="text-ink/40 dark:text-cream/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink/40 dark:text-cream dark:placeholder:text-cream/40"
            placeholder="Search students by name or email…"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-xs text-ink/40 hover:text-ink dark:text-cream/40 dark:hover:text-cream">
              Clear
            </button>
          )}
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-full px-5 py-2 text-xs font-bold transition ${
              filter === "all"
                ? "bg-forest text-white"
                : "bg-white text-ink/75 hover:bg-linen dark:bg-white/5 dark:text-cream/75 dark:hover:bg-white/10"
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilter("enrolled")}
            className={`rounded-full px-5 py-2 text-xs font-bold transition ${
              filter === "enrolled"
                ? "bg-forest text-white"
                : "bg-white text-ink/75 hover:bg-linen dark:bg-white/5 dark:text-cream/75 dark:hover:bg-white/10"
            }`}
          >
            Enrolled ({enrolledCount})
          </button>
          <button
            onClick={() => setFilter("not_enrolled")}
            className={`rounded-full px-5 py-2 text-xs font-bold transition ${
              filter === "not_enrolled"
                ? "bg-forest text-white"
                : "bg-white text-ink/75 hover:bg-linen dark:bg-white/5 dark:text-cream/75 dark:hover:bg-white/10"
            }`}
          >
            Not Enrolled ({notEnrolledCount})
          </button>
        </div>
      </div>

      {/* Student List */}
      {filteredStudents.length === 0 ? (
        <div className="rounded-[2rem] bg-white p-10 text-center shadow-soft dark:bg-white/5 border border-forest/5 dark:border-white/5">
          <Users size={40} className="mx-auto text-ink/20 dark:text-cream/20" />
          <p className="mt-4 font-black text-forest dark:text-cream">No students found</p>
          <p className="mt-2 text-sm text-ink/55 dark:text-cream/55">
            Try adjusting your search query or status filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="grid gap-3 rounded-[1.5rem] bg-white p-4 shadow-soft sm:grid-cols-[auto_1fr_auto_auto] sm:items-center dark:bg-white/5 border border-forest/5 dark:border-white/5"
            >
              {/* Avatar */}
              <div className="grid size-11 shrink-0 place-items-center rounded-full bg-forest/10 text-sm font-black text-forest dark:bg-white/10 dark:text-cream">
                {(student.full_name ?? student.email).charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div>
                <h2 className="font-black text-forest dark:text-cream text-base">
                  {student.full_name ?? "No name set"}
                </h2>
                <p className="text-sm text-ink/60 dark:text-cream/60">{student.email}</p>
                <p className="text-xs text-ink/45 dark:text-cream/45 mt-0.5">
                  <span className={`font-bold ${student.enrollment_count > 0 ? "text-leaf" : "text-clay"}`}>
                    {student.enrollment_count} course{student.enrollment_count !== 1 ? "s" : ""} active
                  </span>
                  &nbsp;·&nbsp; Joined {new Date(student.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>

              {/* Status */}
              <div className="flex gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-black ${
                    student.suspended
                      ? "bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400"
                      : "bg-leaf/10 text-leaf"
                  }`}
                >
                  {student.suspended ? "Suspended" : "Active"}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-black ${
                    student.enrollment_count > 0
                      ? "bg-leaf/10 text-leaf"
                      : "bg-clay/10 text-clay"
                  }`}
                >
                  {student.enrollment_count > 0 ? "Enrolled" : "Not Enrolled"}
                </span>
              </div>

              {/* Actions */}
              <a
                href={`/admin/students/${student.id}`}
                className="rounded-full bg-forest px-4 py-2 text-center text-sm font-bold text-white hover:bg-leaf transition active:scale-95"
              >
                View Details
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
