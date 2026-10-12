"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  GraduationCap,
  Mail,
  Search,
  ShieldCheck,
  UserCheck,
  X,
  Eye,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpDown,
} from "lucide-react";
import { CertificateModal } from "@/components/certificate-modal";

export type StudentCourseItem = {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  thumbnailUrl: string | null;
  enrolledAt: string;
  enrolledAtFormatted: string;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  isEligible: boolean;
  isFree: boolean;
};

export type StudentCertificateSummary = {
  userId: string;
  studentName: string;
  email: string;
  role: string;
  joinedAt: string;
  joinedAtFormatted: string;
  totalCourses: number;
  eligibleCertificates: number;
  averageProgress: number;
  courses: StudentCourseItem[];
};

type SortOption = "courses_desc" | "progress_desc" | "recent" | "name_asc";

export function AdminCertificatesClient({
  students,
}: {
  students: StudentCertificateSummary[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "certified" | "in_progress">("all");
  const [sortBy, setSortBy] = useState<SortOption>("courses_desc");
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  // Modal inspection state for a specific student's course breakdown
  const [activeModalStudent, setActiveModalStudent] = useState<StudentCertificateSummary | null>(null);
  const [modalCourseSearch, setModalCourseSearch] = useState("");
  const [modalCourseFilter, setModalCourseFilter] = useState<"all" | "unlocked" | "in_progress">("all");

  // Certificate Preview Modal
  const [certPreviewCourse, setCertPreviewCourse] = useState<{
    courseTitle: string;
    studentName: string;
    completionPercentage: number;
  } | null>(null);

  // Platform-wide Metrics
  const totalStudents = students.length;
  const totalEnrollments = useMemo(
    () => students.reduce((sum, s) => sum + s.totalCourses, 0),
    [students]
  );
  const totalEligibleCertificates = useMemo(
    () => students.reduce((sum, s) => sum + s.eligibleCertificates, 0),
    [students]
  );
  const certifiedStudentsCount = useMemo(
    () => students.filter((s) => s.eligibleCertificates > 0).length,
    [students]
  );
  const inProgressStudentsCount = totalStudents - certifiedStudentsCount;

  const averagePlatformProgress = useMemo(() => {
    if (totalStudents === 0) return 0;
    const totalProg = students.reduce((sum, s) => sum + s.averageProgress, 0);
    return Math.round(totalProg / totalStudents);
  }, [students, totalStudents]);

  // Filtering & Sorting
  const filteredStudents = useMemo(() => {
    return students
      .filter((student) => {
        const query = search.toLowerCase().trim();
        const matchesQuery =
          !query ||
          student.studentName.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query) ||
          student.courses.some((c) => c.courseTitle.toLowerCase().includes(query));

        if (!matchesQuery) return false;

        if (statusFilter === "certified") {
          return student.eligibleCertificates > 0;
        }
        if (statusFilter === "in_progress") {
          return student.eligibleCertificates === 0;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "courses_desc") return b.totalCourses - a.totalCourses;
        if (sortBy === "progress_desc") return b.averageProgress - a.averageProgress;
        if (sortBy === "recent") return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
        if (sortBy === "name_asc") return a.studentName.localeCompare(b.studentName);
        return 0;
      });
  }, [students, search, statusFilter, sortBy]);

  // Modal filtered courses
  const modalFilteredCourses = useMemo(() => {
    if (!activeModalStudent) return [];
    return activeModalStudent.courses.filter((course) => {
      const q = modalCourseSearch.toLowerCase().trim();
      const matchesQ = !q || course.courseTitle.toLowerCase().includes(q);
      if (!matchesQ) return false;

      if (modalCourseFilter === "unlocked") return course.isEligible;
      if (modalCourseFilter === "in_progress") return !course.isEligible;
      return true;
    });
  }, [activeModalStudent, modalCourseSearch, modalCourseFilter]);

  function toggleExpand(studentId: string) {
    setExpandedStudentId((prev) => (prev === studentId ? null : studentId));
  }

  return (
    <div className="space-y-6">
      {/* ── Executive Metrics Row ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10">
          <div className="flex items-center justify-between text-leaf">
            <UserCheck size={20} />
            <span className="text-[11px] font-black bg-leaf/10 px-2.5 py-0.5 rounded-full">
              Enrolled Body
            </span>
          </div>
          <p className="mt-4 text-xs font-bold uppercase text-ink/50 dark:text-cream/50">
            Total Enrolled Students
          </p>
          <p className="text-3xl font-black text-forest dark:text-cream">{totalStudents}</p>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10">
          <div className="flex items-center justify-between text-amber-500">
            <Award size={20} />
            <span className="text-[11px] font-black bg-amber-500/10 px-2.5 py-0.5 rounded-full">
              70%+ Completed
            </span>
          </div>
          <p className="mt-4 text-xs font-bold uppercase text-ink/50 dark:text-cream/50">
            Certificates Unlocked
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-forest dark:text-cream">
              {totalEligibleCertificates}
            </p>
            <span className="text-xs font-medium text-ink/50 dark:text-cream/50">
              across {certifiedStudentsCount} student{certifiedStudentsCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10">
          <div className="flex items-center justify-between text-blue-500">
            <Layers size={20} />
            <span className="text-[11px] font-black bg-blue-500/10 px-2.5 py-0.5 rounded-full">
              Active Seats
            </span>
          </div>
          <p className="mt-4 text-xs font-bold uppercase text-ink/50 dark:text-cream/50">
            Course Enrollments
          </p>
          <p className="text-3xl font-black text-forest dark:text-cream">{totalEnrollments}</p>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10">
          <div className="flex items-center justify-between text-emerald-500">
            <GraduationCap size={20} />
            <span className="text-[11px] font-black bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
              Platform Avg
            </span>
          </div>
          <p className="mt-4 text-xs font-bold uppercase text-ink/50 dark:text-cream/50">
            Average Completion
          </p>
          <p className="text-3xl font-black text-forest dark:text-cream">
            {averagePlatformProgress}%
          </p>
        </div>
      </div>

      {/* ── Search, Filters, and Sorting Bar ── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <label className="flex flex-1 max-w-md items-center gap-3 rounded-full bg-white px-4 py-3 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10">
          <Search size={18} className="text-ink/40 dark:text-cream/40 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink/40 dark:text-cream dark:placeholder:text-cream/40"
            placeholder="Search student by name, email, or course..."
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-xs font-bold text-ink/40 hover:text-ink dark:text-cream/40 dark:hover:text-cream"
            >
              Clear
            </button>
          )}
        </label>

        {/* Status Filter Tabs & Sort Dropdown */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-full bg-white p-1 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10">
            <button
              onClick={() => setStatusFilter("all")}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                statusFilter === "all"
                  ? "bg-forest text-white"
                  : "text-ink/70 hover:text-forest dark:text-cream/70 dark:hover:text-cream"
              }`}
            >
              All Students ({totalStudents})
            </button>
            <button
              onClick={() => setStatusFilter("certified")}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                statusFilter === "certified"
                  ? "bg-forest text-white"
                  : "text-ink/70 hover:text-forest dark:text-cream/70 dark:hover:text-cream"
              }`}
            >
              Certified ({certifiedStudentsCount})
            </button>
            <button
              onClick={() => setStatusFilter("in_progress")}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                statusFilter === "in_progress"
                  ? "bg-forest text-white"
                  : "text-ink/70 hover:text-forest dark:text-cream/70 dark:hover:text-cream"
              }`}
            >
              In Progress ({inProgressStudentsCount})
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none rounded-full bg-white px-4 py-2.5 pr-8 text-xs font-bold text-forest shadow-soft dark:bg-[#11221a] dark:text-cream border border-forest/10 dark:border-white/10 outline-none cursor-pointer"
            >
              <option value="courses_desc" className="dark:bg-[#11221a] dark:text-cream">
                Most Courses Enrolled
              </option>
              <option value="progress_desc" className="dark:bg-[#11221a] dark:text-cream">
                Highest Progress %
              </option>
              <option value="recent" className="dark:bg-[#11221a] dark:text-cream">
                Recently Joined
              </option>
              <option value="name_asc" className="dark:bg-[#11221a] dark:text-cream">
                Student Name (A-Z)
              </option>
            </select>
            <ArrowUpDown
              size={12}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 dark:text-cream/40"
            />
          </div>
        </div>
      </div>

      {/* ── Student Roster Table ── */}
      <div className="rounded-[2rem] bg-white p-5 sm:p-6 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-forest dark:text-cream flex items-center gap-2">
            <Award size={20} className="text-leaf" /> Student Progress & Certificate Credentials
          </h2>
          <span className="text-xs font-bold text-ink/50 dark:text-cream/50">
            Showing {filteredStudents.length} of {totalStudents} students
          </span>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <UserCheck size={40} className="mx-auto text-ink/20 dark:text-cream/20" />
            <p className="font-black text-forest dark:text-cream text-lg">No students found</p>
            <p className="text-xs text-ink/50 dark:text-cream/50 max-w-sm mx-auto">
              No enrolled students matched your search query or filter. Try clearing filters or searching for another student.
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="rounded-full bg-forest px-4 py-1.5 text-xs font-bold text-white hover:bg-leaf transition"
              >
                Reset Search
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-forest/10 dark:border-white/10 text-ink/50 dark:text-cream/50 text-[11px] font-black uppercase tracking-wider">
                  <th className="pb-3 pl-3">Student Name & Contact</th>
                  <th className="pb-3">Joined Date</th>
                  <th className="pb-3">Enrolled Courses</th>
                  <th className="pb-3">Certificates Status</th>
                  <th className="pb-3">Overall Progress</th>
                  <th className="pb-3 text-right pr-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/5 dark:divide-white/5">
                {filteredStudents.map((student) => {
                  const isExpanded = expandedStudentId === student.userId;
                  const hasCertificates = student.eligibleCertificates > 0;

                  return (
                    <tr
                      key={student.userId}
                      className="group hover:bg-linen/40 dark:hover:bg-white/5 transition"
                    >
                      {/* Column 1: Student Profile */}
                      <td className="py-4 pl-3">
                        <div className="flex items-center gap-3">
                          <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-forest to-leaf text-white font-black text-sm shrink-0 shadow-sm">
                            {student.studentName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                onClick={() => setActiveModalStudent(student)}
                                className="font-bold text-forest dark:text-cream hover:text-leaf transition cursor-pointer text-sm"
                              >
                                {student.studentName}
                              </span>
                              {student.role === "admin" && (
                                <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[10px] font-black text-forest dark:bg-white/10 dark:text-cream">
                                  Admin
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-ink/50 dark:text-cream/50 font-mono">
                              {student.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Joined Date */}
                      <td className="py-4 text-ink/65 dark:text-cream/65 font-mono text-xs whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-leaf" />
                          <span>{student.joinedAtFormatted}</span>
                        </div>
                      </td>

                      {/* Column 3: Enrolled Courses */}
                      <td className="py-4 whitespace-nowrap">
                        <button
                          onClick={() => setActiveModalStudent(student)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-leaf/10 hover:bg-leaf/20 px-3 py-1 text-xs font-black text-forest dark:text-cream transition"
                        >
                          <BookOpen size={13} className="text-leaf" />
                          <span>
                            {student.totalCourses} Course{student.totalCourses !== 1 ? "s" : ""}
                          </span>
                        </button>
                      </td>

                      {/* Column 4: Certificates Status */}
                      <td className="py-4 whitespace-nowrap">
                        {hasCertificates ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-black text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 size={13} />
                            <span>
                              {student.eligibleCertificates} of {student.totalCourses} Unlocked
                            </span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/25 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                            <Clock size={13} />
                            <span>0 / {student.totalCourses} In Progress</span>
                          </span>
                        )}
                      </td>

                      {/* Column 5: Overall Progress */}
                      <td className="py-4 whitespace-nowrap">
                        <div className="w-32 space-y-1">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-forest dark:text-cream">
                              {student.averageProgress}% Avg
                            </span>
                            <span className="text-ink/40 dark:text-cream/40 text-[10px]">
                              {student.courses.filter((c) => c.progressPercent >= 70).length} done
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-forest/10 dark:bg-white/10 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                student.averageProgress >= 70
                                  ? "bg-emerald-500"
                                  : student.averageProgress > 0
                                  ? "bg-amber-500"
                                  : "bg-ink/20 dark:bg-white/20"
                              }`}
                              style={{ width: `${Math.max(4, student.averageProgress)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Column 6: Actions */}
                      <td className="py-4 text-right pr-3 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setActiveModalStudent(student)}
                            className="inline-flex items-center gap-1.5 rounded-full bg-forest px-3.5 py-1.5 text-xs font-bold text-white hover:bg-leaf transition shadow-sm active:scale-95"
                          >
                            <Eye size={13} />
                            <span>View Courses ({student.totalCourses})</span>
                          </button>

                          <button
                            onClick={() => toggleExpand(student.userId)}
                            title={isExpanded ? "Collapse course list" : "Expand quick preview"}
                            className="grid size-8 place-items-center rounded-full bg-forest/5 hover:bg-forest/10 dark:bg-white/10 text-ink/70 dark:text-cream/70 transition"
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Inline Expandable View (Accordion under table) ── */}
      {expandedStudentId && (
        <div className="rounded-[2rem] bg-gradient-to-b from-linen/60 to-white dark:from-[#11221a] dark:to-[#0b1712] p-6 shadow-soft border border-forest/10 dark:border-white/10 space-y-4 animate-in fade-in-50 duration-200">
          {(() => {
            const student = students.find((s) => s.userId === expandedStudentId);
            if (!student) return null;
            return (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-forest/10 dark:border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-xl bg-forest text-white font-black text-sm">
                      {student.studentName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-black text-forest dark:text-cream text-base">
                        {student.studentName} — Course Progress Breakdown
                      </h3>
                      <p className="text-xs text-ink/50 dark:text-cream/50">
                        {student.totalCourses} total enrolled courses · {student.eligibleCertificates} certificates unlocked
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveModalStudent(student)}
                      className="rounded-full bg-forest px-4 py-1.5 text-xs font-bold text-white hover:bg-leaf transition shadow-sm"
                    >
                      Open Full Screen Inspector
                    </button>
                    <button
                      onClick={() => setExpandedStudentId(null)}
                      className="grid size-8 place-items-center rounded-full bg-forest/5 hover:bg-forest/10 dark:bg-white/10 text-ink/60 dark:text-cream/60"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 max-h-96 overflow-y-auto pr-1">
                  {student.courses.map((course) => (
                    <div
                      key={course.courseId}
                      className="rounded-2xl bg-white dark:bg-white/5 p-4 border border-forest/10 dark:border-white/10 space-y-2.5 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-forest dark:text-cream text-xs line-clamp-2">
                          {course.courseTitle}
                        </h4>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase shrink-0 ${
                            course.isFree
                              ? "bg-slate-500/10 text-slate-600 dark:text-slate-400"
                              : "bg-leaf/10 text-leaf"
                          }`}
                        >
                          {course.isFree ? "Free Class" : "Premium"}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-ink/60 dark:text-cream/60">
                          <span>
                            {course.completedLessons} / {course.totalLessons} lessons
                          </span>
                          <span>{course.progressPercent}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-forest/10 dark:bg-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              course.isEligible ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                            style={{ width: `${Math.max(4, course.progressPercent)}%` }}
                          />
                        </div>
                      </div>

                      {/* Certificate Status Badge */}
                      <div className="flex items-center justify-between pt-1">
                        {course.isEligible ? (
                          <button
                            onClick={() =>
                              setCertPreviewCourse({
                                courseTitle: course.courseTitle,
                                studentName: student.studentName,
                                completionPercentage: course.progressPercent,
                              })
                            }
                            className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 px-2.5 py-0.5 text-[10px] font-black text-emerald-700 dark:text-emerald-400 transition"
                          >
                            <CheckCircle2 size={11} />
                            <span>Certificate Unlocked (Preview)</span>
                          </button>
                        ) : course.isFree ? (
                          <span className="text-[10px] text-ink/40 dark:text-cream/40">
                            No certificate for free class
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                            <Clock size={11} />
                            <span>In Progress ({Math.max(0, 70 - course.progressPercent)}% to unlock)</span>
                          </span>
                        )}

                        <span className="text-[10px] font-mono text-ink/40 dark:text-cream/40">
                          {course.enrolledAtFormatted}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── Slide-over Modal: Deep Student Course & Certificate Inspector ── */}
      {activeModalStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-6 backdrop-blur-md overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModalStudent(null);
          }}
        >
          <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-[2.5rem] bg-white shadow-2xl dark:bg-[#0e1f18] border border-forest/10 dark:border-white/10 animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 sm:p-8 border-b border-forest/10 dark:border-white/10 bg-linen/30 dark:bg-white/5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="grid size-14 place-items-center rounded-3xl bg-gradient-to-br from-forest to-leaf text-white font-black text-xl shadow-md">
                    {activeModalStudent.studentName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-black text-forest dark:text-cream">
                        {activeModalStudent.studentName}
                      </h3>
                      {activeModalStudent.role === "admin" && (
                        <span className="rounded-full bg-forest/10 px-2.5 py-0.5 text-xs font-black text-forest dark:bg-white/10 dark:text-cream">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-ink/60 dark:text-cream/60 font-mono">
                      {activeModalStudent.email}
                    </p>
                    <p className="text-xs text-ink/45 dark:text-cream/45 mt-0.5">
                      Joined {activeModalStudent.joinedAtFormatted}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/students/${activeModalStudent.userId}`}
                    className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-white/10 px-3.5 py-1.5 text-xs font-bold text-forest dark:text-cream hover:bg-linen transition border border-forest/10 dark:border-white/10"
                  >
                    <span>LMS Student Profile</span>
                    <ExternalLink size={12} />
                  </Link>
                  <button
                    onClick={() => setActiveModalStudent(null)}
                    className="grid size-10 place-items-center rounded-full bg-forest/5 hover:bg-forest/10 dark:bg-white/10 text-ink/70 dark:text-cream/70 transition"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Stats badges */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white dark:bg-white/5 p-3.5 border border-forest/10 dark:border-white/10 text-center">
                  <p className="text-[10px] font-bold uppercase text-ink/50 dark:text-cream/50">
                    Enrolled Courses
                  </p>
                  <p className="text-xl font-black text-forest dark:text-cream">
                    {activeModalStudent.totalCourses}
                  </p>
                </div>
                <div className="rounded-2xl bg-white dark:bg-white/5 p-3.5 border border-forest/10 dark:border-white/10 text-center">
                  <p className="text-[10px] font-bold uppercase text-ink/50 dark:text-cream/50">
                    Certificates Unlocked
                  </p>
                  <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {activeModalStudent.eligibleCertificates}
                  </p>
                </div>
                <div className="rounded-2xl bg-white dark:bg-white/5 p-3.5 border border-forest/10 dark:border-white/10 text-center">
                  <p className="text-[10px] font-bold uppercase text-ink/50 dark:text-cream/50">
                    Average Progress
                  </p>
                  <p className="text-xl font-black text-forest dark:text-cream">
                    {activeModalStudent.averageProgress}%
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body Controls: Search and Filter Courses */}
            <div className="p-4 sm:px-8 border-b border-forest/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
              <label className="flex flex-1 max-w-sm items-center gap-2 rounded-full bg-linen/50 dark:bg-white/5 px-3.5 py-2 border border-forest/10 dark:border-white/10 text-xs">
                <Search size={15} className="text-ink/40 dark:text-cream/40 shrink-0" />
                <input
                  value={modalCourseSearch}
                  onChange={(e) => setModalCourseSearch(e.target.value)}
                  placeholder="Filter student courses by name..."
                  className="w-full bg-transparent outline-none placeholder:text-ink/40 dark:text-cream dark:placeholder:text-cream/40"
                />
                {modalCourseSearch && (
                  <button
                    onClick={() => setModalCourseSearch("")}
                    className="text-[10px] font-bold text-ink/40 hover:text-ink dark:text-cream/40"
                  >
                    Clear
                  </button>
                )}
              </label>

              <div className="flex items-center gap-1 rounded-full bg-linen/50 dark:bg-white/5 p-1 border border-forest/10 dark:border-white/10">
                <button
                  onClick={() => setModalCourseFilter("all")}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                    modalCourseFilter === "all"
                      ? "bg-forest text-white"
                      : "text-ink/60 hover:text-forest dark:text-cream/60 dark:hover:text-cream"
                  }`}
                >
                  All ({activeModalStudent.totalCourses})
                </button>
                <button
                  onClick={() => setModalCourseFilter("unlocked")}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                    modalCourseFilter === "unlocked"
                      ? "bg-forest text-white"
                      : "text-ink/60 hover:text-forest dark:text-cream/60 dark:hover:text-cream"
                  }`}
                >
                  Unlocked ({activeModalStudent.eligibleCertificates})
                </button>
                <button
                  onClick={() => setModalCourseFilter("in_progress")}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                    modalCourseFilter === "in_progress"
                      ? "bg-forest text-white"
                      : "text-ink/60 hover:text-forest dark:text-cream/60 dark:hover:text-cream"
                  }`}
                >
                  In Progress ({activeModalStudent.totalCourses - activeModalStudent.eligibleCertificates})
                </button>
              </div>
            </div>

            {/* Modal Course List */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-3">
              {modalFilteredCourses.length === 0 ? (
                <div className="py-12 text-center text-ink/40 dark:text-cream/40 text-xs">
                  No courses matching filter.
                </div>
              ) : (
                modalFilteredCourses.map((course) => (
                  <div
                    key={course.courseId}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-linen/30 dark:bg-white/5 p-4 border border-forest/10 dark:border-white/10 hover:border-forest/20 transition"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="grid size-12 place-items-center rounded-xl bg-forest/10 dark:bg-white/10 text-forest dark:text-cream shrink-0">
                        <BookOpen size={20} />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-forest dark:text-cream text-sm">
                            {course.courseTitle}
                          </h4>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                              course.isFree
                                ? "bg-slate-500/15 text-slate-700 dark:text-slate-300"
                                : "bg-leaf/10 text-leaf"
                            }`}
                          >
                            {course.isFree ? "Free Class" : "Premium"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-ink/50 dark:text-cream/50">
                          <span>Enrolled: {course.enrolledAtFormatted}</span>
                          <span>·</span>
                          <span className="font-semibold text-forest dark:text-cream">
                            {course.completedLessons} of {course.totalLessons} lessons
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar & Status Button */}
                    <div className="flex items-center gap-4 sm:w-64 shrink-0">
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between text-xs font-bold text-forest dark:text-cream">
                          <span>{course.progressPercent}%</span>
                          <span className="text-[10px] text-ink/40 dark:text-cream/40">
                            {course.isEligible ? "Unlocked" : `${Math.max(0, 70 - course.progressPercent)}% to 70%`}
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-forest/10 dark:bg-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              course.isEligible
                                ? "bg-emerald-500"
                                : course.progressPercent > 0
                                ? "bg-amber-500"
                                : "bg-ink/20 dark:bg-white/20"
                            }`}
                            style={{ width: `${Math.max(4, course.progressPercent)}%` }}
                          />
                        </div>
                      </div>

                      <div className="shrink-0">
                        {course.isEligible ? (
                          <button
                            onClick={() =>
                              setCertPreviewCourse({
                                courseTitle: course.courseTitle,
                                studentName: activeModalStudent.studentName,
                                completionPercentage: course.progressPercent,
                              })
                            }
                            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-black text-white hover:bg-emerald-700 transition shadow-sm active:scale-95"
                          >
                            <Award size={13} />
                            <span>Preview</span>
                          </button>
                        ) : course.isFree ? (
                          <span className="text-[11px] text-ink/40 dark:text-cream/40 italic">
                            No Cert
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                            <Clock size={12} />
                            <span>In Progress</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:px-8 border-t border-forest/10 dark:border-white/10 flex items-center justify-between bg-linen/20 dark:bg-white/5">
              <span className="text-xs text-ink/50 dark:text-cream/50">
                LMS ID: <code className="font-mono">{activeModalStudent.userId}</code>
              </span>
              <button
                onClick={() => setActiveModalStudent(null)}
                className="rounded-full bg-forest px-5 py-2 text-xs font-bold text-white hover:bg-leaf transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Certificate Preview Modal ── */}
      {certPreviewCourse && (
        <CertificateModal
          open={Boolean(certPreviewCourse)}
          onClose={() => setCertPreviewCourse(null)}
          courseTitle={certPreviewCourse.courseTitle}
          initialName={certPreviewCourse.studentName}
          completionPercentage={certPreviewCourse.completionPercentage}
        />
      )}
    </div>
  );
}
