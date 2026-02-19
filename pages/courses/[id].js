import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { useAuth } from "../_app";
import Layout from "../../components/Layout";
import toast from "react-hot-toast";

export default function CourseDetail() {
  const { user, api, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [tab, setTab] = useState("overview");
  const [matForm, setMatForm] = useState({ title: "", type: "pdf", url: "" });
  const [showMat, setShowMat] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading]);

  const load = async () => {
    if (!id) return;
    try {
      const d = await api(`/api/courses/${id}`);
      setCourse(d.course);
      setAssignments(d.assignments || []);
    } catch {
      toast.error("Course not found");
      router.push("/courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && id) load();
  }, [user, id]);

  const enroll = async () => {
    try {
      await api(`/api/courses/enroll?id=${id}`, { method: "POST" });
      toast.success("Enrolled! 🎓");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const addMaterial = async (e) => {
    e.preventDefault();
    try {
      await api(`/api/courses/${id}`, {
        method: "PUT",
        body: { materials: [...(course.materials || []), matForm] },
      });
      toast.success("Material added!");
      setShowMat(false);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!user || loading)
    return (
      <Layout title="Course">
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-green-200 border-t-ganpat-green rounded-full animate-spin" />
        </div>
      </Layout>
    );

  if (!course) return null;

  const isEnrolled = course.enrolledStudents?.some(
    (s) => s._id === user.id || s === user.id,
  );
  const isFaculty = course.faculty?._id === user.id || user.role === "admin";
  const typeIcon = { pdf: "📄", video: "🎥", link: "🔗", doc: "📝" };

  return (
    <>
      <Head>
        <title>{course.title} – Ganpat LMS</title>
      </Head>
      <Layout title="">
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          <button
            onClick={() => router.push("/courses")}
            className="btn-ghost text-sm"
          >
            ← Back to Courses
          </button>

          {/* Hero */}
          <div
            className="rounded-3xl p-8 text-white relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg,#14532d,#1a6b3a,#2EAD5C)",
            }}
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
            <div className="relative z-10">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="badge bg-white/20 text-white">
                  {course.code}
                </span>
                <span className="badge bg-white/15 text-white">
                  {course.department}
                </span>
                <span className="badge bg-white/10 text-white">
                  Sem {course.semester}
                </span>
                <span className="badge bg-white/10 text-white">
                  {course.credits} Credits
                </span>
              </div>
              <h1 className="text-2xl font-heading font-bold mb-2">
                {course.title}
              </h1>
              <p className="text-green-200 text-sm">{course.description}</p>
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-green-200">
                <span>👨‍🏫 {course.faculty?.name}</span>
                <span>
                  👥 {course.enrolledStudents?.length}/{course.maxStudents}{" "}
                  students
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            {user.role === "student" && !isEnrolled && (
              <button onClick={enroll} className="btn-primary">
                🎓 Enroll Now
              </button>
            )}
            {isEnrolled && (
              <span className="px-4 py-2 rounded-xl bg-green-50 text-ganpat-green font-semibold text-sm border border-green-200">
                ✅ Enrolled
              </span>
            )}
            {isFaculty && (
              <button onClick={() => setShowMat(true)} className="btn-outline">
                📎 Add Material
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-green-100 pb-0">
            {["overview", "materials", "assignments", "students"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-sm font-semibold capitalize transition-all border-b-2 -mb-px ${
                  tab === t
                    ? "border-ganpat-green text-ganpat-green"
                    : "border-transparent text-gray-500 hover:text-ganpat-green"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "overview" && (
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="card">
                <h3 className="font-heading font-bold text-gray-800 mb-4">
                  📅 Schedule
                </h3>
                <div className="space-y-2 text-sm">
                  {[
                    ["Days", course.schedule?.days?.join(", ") || "TBD"],
                    ["Time", course.schedule?.time || "TBD"],
                    ["Room", course.schedule?.room || "TBD"],
                    ["Year", course.academicYear],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="flex justify-between py-1 border-b border-green-50"
                    >
                      <span className="text-gray-400">{k}</span>
                      <span className="font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <h3 className="font-heading font-bold text-gray-800 mb-4">
                  👨‍🏫 Instructor
                </h3>
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                    style={{
                      background: "linear-gradient(135deg,#1a6b3a,#2EAD5C)",
                    }}
                  >
                    {course.faculty?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">
                      {course.faculty?.name}
                    </p>
                    <p className="text-sm text-gray-400">
                      {course.faculty?.email}
                    </p>
                    {course.faculty?.bio && (
                      <p className="text-xs text-gray-400 mt-1">
                        {course.faculty.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "materials" && (
            <div className="card">
              <h3 className="font-heading font-bold text-gray-800 mb-4">
                📁 Study Materials ({course.materials?.length || 0})
              </h3>
              {!course.materials?.length ? (
                <p className="text-gray-400 text-center py-8">
                  No materials added yet
                </p>
              ) : (
                <div className="space-y-3">
                  {course.materials.map((m, i) => (
                    <a
                      key={i}
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 rounded-xl bg-green-50 hover:bg-green-100 border border-green-100 transition-colors"
                    >
                      <span className="text-2xl">
                        {typeIcon[m.type] || "📎"}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-800">
                          {m.title}
                        </p>
                        <p className="text-xs text-gray-400 capitalize">
                          {m.type} · Added{" "}
                          {new Date(m.uploadedAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      <span className="text-ganpat-green text-sm font-medium">
                        Open ↗
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "assignments" && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading font-black text-gray-800">
                  📝 Assignments
                </h3>
                {isFaculty && (
                  <button
                    onClick={() => router.push(`/assignments`)}
                    className="btn-primary text-xs py-2"
                  >
                    Create New
                  </button>
                )}
              </div>
              {!assignments.length ? (
                <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                    No assignments yet
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {assignments.map((a) => {
                    const submitted = a.submissions?.some(
                      (s) =>
                        s.student === user.id || s.student?._id === user.id,
                    );
                    return (
                      <Link
                        href={`/assignments/${a._id}`}
                        key={a._id}
                        className="flex items-center justify-between p-5 rounded-[2rem] bg-white border border-gray-100 hover:border-ganpat-green transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center text-lg">
                            📝
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 group-hover:text-ganpat-green transition-colors">
                              {a.title}
                            </p>
                            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
                              Due: {new Date(a.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {submitted ? (
                            <span className="badge-green">Submitted</span>
                          ) : (
                            <span className="badge-red">Pending</span>
                          )}
                          <span className="text-xl text-gray-300 group-hover:translate-x-1 transition-transform">
                            →
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === "students" && (
            <div className="card">
              <h3 className="font-heading font-bold text-gray-800 mb-4">
                👥 Enrolled Students ({course.enrolledStudents?.length})
              </h3>
              {!course.enrolledStudents?.length ? (
                <p className="text-gray-400 text-center py-8">
                  No students enrolled yet
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {course.enrolledStudents.map((s) => (
                    <div
                      key={s._id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-100"
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                        style={{
                          background: "linear-gradient(135deg,#1a6b3a,#2EAD5C)",
                        }}
                      >
                        {s.name?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-gray-800 truncate">
                          {s.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {s.enrollmentId || s.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add Material Modal */}
        {showMat && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-heading font-bold text-ganpat-green">
                  Add Material
                </h2>
                <button
                  onClick={() => setShowMat(false)}
                  className="text-gray-400 text-2xl"
                >
                  ×
                </button>
              </div>
              <form onSubmit={addMaterial} className="space-y-4">
                <div>
                  <label className="label">Title *</label>
                  <input
                    className="input"
                    required
                    value={matForm.title}
                    onChange={(e) =>
                      setMatForm({ ...matForm, title: e.target.value })
                    }
                    placeholder="e.g. Week 1 Slides"
                  />
                </div>
                <div>
                  <label className="label">Type</label>
                  <select
                    className="input"
                    value={matForm.type}
                    onChange={(e) =>
                      setMatForm({ ...matForm, type: e.target.value })
                    }
                  >
                    {["pdf", "video", "link", "doc"].map((t) => (
                      <option key={t} value={t}>
                        {t.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">URL / Link *</label>
                  <input
                    className="input"
                    required
                    value={matForm.url}
                    onChange={(e) =>
                      setMatForm({ ...matForm, url: e.target.value })
                    }
                    placeholder="https://…"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowMat(false)}
                    className="flex-1 btn-outline"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    Add Material
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Layout>
    </>
  );
}
