import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { useAuth } from "./_app";
import Layout from "../components/Layout";

function StatCard({ icon, label, value, sub, color, href, className = "" }) {
  const Wrap = href ? Link : "div";
  return (
    <Wrap
      href={href || "#"}
      className={`card flex items-center justify-between gap-6 border-l-[6px] ${color} hover:cursor-pointer group shadow-premium hover:shadow-green-glow transition-all duration-300 ${className}`}
    >
      <div className="flex-1">
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-2">{label}</p>
        <div className="flex items-center gap-3">
          <p className="text-4xl font-black font-heading text-gray-800 tracking-tight leading-none">{value}</p>
          {sub && <p className="text-xs text-gray-400 font-bold max-w-[100px] leading-tight mt-1">{sub}</p>}
        </div>
      </div>
      <div className="w-16 h-16 rounded-[2rem] bg-gray-50/50 flex items-center justify-center text-3xl group-hover:scale-110 group-hover:bg-white transition-all duration-500 shadow-inner">
        {icon}
      </div>
    </Wrap>
  );
}

export default function Dashboard() {
  const { user, api, loading: authLoading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([api("/api/courses/my"), api("/api/assignments")])
      .then(([c, a]) => {
        setCourses(c.courses || []);
        setAssignments(a.assignments || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, api]);

  const getCourseProgress = (courseId) => {
    const courseAssignments = assignments.filter(
      (a) => a.course === courseId || a.course?._id === courseId
    );
    if (courseAssignments.length === 0) return 0;
    const submitted = courseAssignments.filter((a) =>
      a.submissions?.some(
        (s) => s.student === user.id || s.student?._id === user.id
      )
    ).length;
    return Math.round((submitted / courseAssignments.length) * 100);
  };

  if (!user) return null;

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
  };

  const unsubmitted = assignments.filter((a) => {
    const mine = a.submissions?.find(
      (s) => s.student === user.id || s.student?._id === user.id,
    );
    return !mine && new Date(a.dueDate) > new Date();
  });

  return (
    <>
      <Head>
        <title>Dashboard – Ganpat LMS</title>
      </Head>
      <Layout title="">
        <div className="space-y-10 animate-fade-in max-w-7xl mx-auto">
          {/* Hero banner */}
          <div
            className="rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-green-glow"
            style={{
              background:
                "linear-gradient(135deg,#14532d 0%,#1a6b3a 60%,#2EAD5C 100%)",
            }}
          >
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/5 -mr-40 -mt-40 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-ganpat-gold/10 -ml-32 -mb-32 blur-2xl" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-green-200 text-xs font-bold uppercase tracking-[0.2em] mb-2">
                  {greeting()} 👋
                </p>
                <h1 className="text-4xl md:text-5xl font-heading font-black mb-4 tracking-tight">
                  {user.name}
                </h1>
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-1.5 rounded-2xl bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest">
                    {user.role}
                  </span>
                  {user.department && (
                    <span className="px-4 py-1.5 rounded-2xl bg-white/10 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest">
                      {user.department}
                    </span>
                  )}
                  {user.enrollmentId && (
                    <span className="px-4 py-1.5 rounded-2xl bg-white/10 backdrop-blur-sm text-[10px] font-bold font-mono">
                      {user.enrollmentId}
                    </span>
                  )}
                </div>
              </div>
              <div className="hidden lg:block text-right">
                <p className="text-4xl font-black">{courses.length}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                  Courses Enrolled
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-6">
            <StatCard
              icon="📚"
              label="Active Courses"
              value={loading ? "…" : courses.length}
              sub={
                user.role === "faculty"
                  ? "Subjects you teach"
                  : "Subjects currently enrolled"
              }
              color="border-ganpat-green"
              href="/courses"
              className="w-full md:w-auto md:min-w-[400px] bg-gradient-to-br from-white to-green-50/30"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/courses" className="card p-6 flex flex-col sm:flex-row items-center gap-4 hover:bg-green-50/50 transition-all border-none bg-white/40 backdrop-blur-sm group">
              <div className="w-12 h-12 flex-shrink-0 rounded-2xl bg-ganpat-green/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📚</div>
              <div className="text-center sm:text-left">
                <p className="font-bold text-gray-800 text-sm">Browse Courses</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Explore Syllabus</p>
              </div>
            </Link>
            <Link href="/assignments" className="card p-6 flex flex-col sm:flex-row items-center gap-4 hover:bg-orange-50/50 transition-all border-none bg-white/40 backdrop-blur-sm group">
              <div className="w-12 h-12 flex-shrink-0 rounded-2xl bg-orange-400/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📝</div>
              <div className="text-center sm:text-left">
                <p className="font-bold text-gray-800 text-sm">Assignments</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">View Deadlines</p>
              </div>
            </Link>
            <Link href="/profile" className="card p-6 flex flex-col sm:flex-row items-center gap-4 hover:bg-blue-50/50 transition-all border-none bg-white/40 backdrop-blur-sm group">
              <div className="w-12 h-12 flex-shrink-0 rounded-2xl bg-blue-500/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">⚙️</div>
              <div className="text-center sm:text-left">
                <p className="font-bold text-gray-800 text-sm">Settings</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Edit Profile</p>
              </div>
            </Link>
            <Link href="mailto:support@ganpat.ac.in" className="card p-6 flex flex-col sm:flex-row items-center gap-4 hover:bg-purple-50/50 transition-all border-none bg-white/40 backdrop-blur-sm group">
              <div className="w-12 h-12 flex-shrink-0 rounded-2xl bg-purple-500/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📣</div>
              <div className="text-center sm:text-left">
                <p className="font-bold text-gray-800 text-sm">Support</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Contact Help</p>
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* My Courses */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-heading font-black text-gray-800 tracking-tight">
                  {user.role === "faculty"
                    ? "📖 Courses I Teach"
                    : "📖 My Learning Path"}
                </h2>
                <Link
                  href="/courses"
                  className="text-xs font-bold text-ganpat-green hover:underline uppercase tracking-widest"
                >
                  View all →
                </Link>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="card h-28 animate-pulse bg-gray-50 border-none"
                    />
                  ))}
                </div>
              ) : courses.length === 0 ? (
                <div className="card text-center py-20 bg-gradient-to-b from-white to-green-50/30">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">📚</span>
                  </div>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                    No active courses
                  </p>
                  <Link href="/courses" className="btn-primary mt-6">
                    Explore Catalog
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {courses.slice(0, 4).map((c) => {
                    const progress = getCourseProgress(c._id);
                    return (
                      <Link
                        href={`/courses/${c._id}`}
                        key={c._id}
                        className="card p-8 flex flex-col justify-between group relative overflow-hidden transition-all duration-300 transform hover:-translate-y-2"
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-ganpat-green/5 rounded-full -mr-12 -mt-12 transition-transform duration-500 group-hover:scale-150" />
                        
                        <div className="flex justify-between items-start mb-6 relative z-10">
                          <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg group-hover:rotate-6 transition-transform duration-300"
                            style={{
                              background:
                                "linear-gradient(135deg,#14532d,#2EAD5C)",
                            }}
                          >
                            {c.code?.slice(0, 2)}
                          </div>
                          <span className="badge-green ring-4 ring-green-50/50">Sem {c.semester}</span>
                        </div>

                        <div className="relative z-10">
                          <h3 className="font-bold text-lg text-gray-800 leading-tight group-hover:text-ganpat-green transition-colors mb-2">
                            {c.title}
                          </h3>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-ganpat-green" />
                            {c.code} • {c.faculty?.name}
                          </p>
                        </div>

                        <div className="mt-8 relative z-10">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Course Progress</span>
                            <span className="text-xs font-black text-ganpat-green">{progress}%</span>
                          </div>
                          <div className="progress h-2 bg-gray-100/80">
                            <div 
                              className="progress-bar shadow-sm" 
                              style={{ width: `${progress}%` }} 
                            />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Assignments / Activity */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-heading font-black text-gray-800 tracking-tight">
                  🕒 Due Soon
                </h2>
                <Link
                  href="/assignments"
                  className="text-xs font-bold text-ganpat-green hover:underline uppercase tracking-widest"
                >
                  View all
                </Link>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="card h-24 animate-pulse bg-gray-50 border-none"
                    />
                  ))}
                </div>
              ) : unsubmitted.length === 0 ? (
                <div className="card text-center py-16 bg-gradient-to-b from-white to-green-50/30">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">✅</span>
                  </div>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                    All caught up!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {unsubmitted.slice(0, 4).map((a) => {
                    const d = Math.ceil(
                      (new Date(a.dueDate) - new Date()) / 86400000,
                    );
                    return (
                      <Link
                        href={`/assignments/${a._id}`}
                        key={a._id}
                        className="card p-5 border-l-4 border-orange-400 group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-16 h-16 bg-orange-400/5 rounded-full -mr-8 -mt-8" />
                        <div className="flex items-start justify-between gap-4 relative z-10">
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-gray-800 group-hover:text-orange-600 transition-colors line-clamp-2 leading-tight">
                              {a.title}
                            </p>
                            <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-wider truncate">
                              {a.course?.title}
                            </p>
                          </div>
                          <span
                            className={`badge-orange flex-shrink-0 tabular-nums`}
                          >
                            {d}d left
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Quick Actions Card */}
              <div className="card bg-ganpat-green p-6 text-white overflow-hidden relative group">
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="font-bold text-sm mb-4 relative z-10">
                  🚀 Quick Tasks
                </h3>
                <div className="space-y-3 relative z-10">
                  <Link
                    href="/courses"
                    className="flex items-center gap-3 text-xs font-bold bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-all"
                  >
                    <span>📚</span> Browse New Courses
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 text-xs font-bold bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-all"
                  >
                    <span>👤</span> Update My Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
