import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { useAuth } from "../_app";
import Layout from "../../components/Layout";
import toast from "react-hot-toast";

function CourseCard({ course, enrolled, onEnroll, userRole }) {
  const pct = Math.round(
    (course.enrolledStudents?.length / course.maxStudents) * 100,
  );
  return (
    <div className="card flex flex-col border-2 border-transparent hover:border-green-200">
      {/* Top colour strip */}
      <div
        className="h-28 -mx-6 -mt-6 rounded-t-2xl flex items-center justify-center relative overflow-hidden mb-4"
        style={{ background: "linear-gradient(135deg,#14532d,#2EAD5C)" }}
      >
        <div className="absolute top-3 right-3">
          <span className="badge bg-white/20 text-white">
            {course.credits} Credits
          </span>
        </div>
        <div className="text-center">
          <p className="text-3xl font-heading font-bold text-white">
            {course.code}
          </p>
          <p className="text-green-200 text-xs mt-0.5">{course.department}</p>
        </div>
      </div>

      <h3 className="font-heading font-bold text-sm text-gray-800 mb-1 line-clamp-2">
        {course.title}
      </h3>
      <p className="text-xs text-gray-400 line-clamp-2 mb-3">
        {course.description}
      </p>

      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#1a6b3a,#2EAD5C)" }}
        >
          {course.faculty?.name?.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-700 truncate">
            {course.faculty?.name}
          </p>
          <p className="text-xs text-gray-400">Sem {course.semester}</p>
        </div>
      </div>

      {/* Capacity */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>
            👥 {course.enrolledStudents?.length}/{course.maxStudents}
          </span>
          <span>{pct}% full</span>
        </div>
        <div className="progress">
          <div className="progress-bar" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="flex gap-2 mt-auto">
        <Link
          href={`/courses/${course._id}`}
          className="flex-1 btn-outline text-xs py-2 justify-center"
        >
          Details
        </Link>
        {userRole === "student" &&
          (enrolled ? (
            <span className="flex-1 flex items-center justify-center text-xs font-semibold text-ganpat-green bg-green-50 rounded-xl px-3">
              ✅ Enrolled
            </span>
          ) : (
            <button
              onClick={() => onEnroll(course._id)}
              className="flex-1 btn-primary text-xs py-2"
            >
              Enroll
            </button>
          ))}
      </div>
    </div>
  );
}

export default function Courses() {
  const { user, api, loading: authLoading } = useAuth();
  const router = useRouter();
  const [all, setAll] = useState([]);
  const [my, setMy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    code: "",
    description: "",
    department: "Computer Science",
    semester: "1",
    credits: "4",
    maxStudents: "60",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading]);

  const load = async () => {
    try {
      const [a, m] = await Promise.all([
        api("/api/courses"),
        api("/api/courses/my"),
      ]);
      setAll(a.courses);
      setMy(m.courses);
    } catch {
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (user) load();
  }, [user]);

  const enroll = async (id) => {
    try {
      await api(`/api/courses/enroll?id=${id}`, { method: "POST" });
      toast.success("Enrolled! 🎓");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const create = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api("/api/courses", { method: "POST", body: form });
      toast.success("Course created!");
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const enrolledIds = my.map((c) => c._id);
  const list = (tab === "all" ? all : my).filter(
    (c) =>
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.code?.toLowerCase().includes(search.toLowerCase()),
  );

  if (!user) return null;

  return (
    <>
      <Head>
        <title>Courses – Ganpat LMS</title>
      </Head>
      <Layout title="📚 Courses">
        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              {all.length} courses available
            </p>
            {["faculty", "admin"].includes(user.role) && (
              <button onClick={() => setShowForm(true)} className="btn-primary">
                + Create Course
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              className="input max-w-xs"
              placeholder="🔍 Search by name or code…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex gap-2">
              {["all", "my"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t ? "bg-ganpat-green text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-green-300"}`}
                >
                  {t === "all"
                    ? "All Courses"
                    : user.role === "faculty"
                      ? "My Courses"
                      : "Enrolled"}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card h-64 animate-pulse bg-gray-50" />
              ))}
            </div>
          ) : list.length === 0 ? (
            <div className="card text-center py-16">
              <p className="text-5xl mb-3">📚</p>
              <p className="text-gray-400 font-medium">No courses found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {list.map((c) => (
                <CourseCard
                  key={c._id}
                  course={c}
                  enrolled={enrolledIds.includes(c._id)}
                  onEnroll={enroll}
                  userRole={user.role}
                />
              ))}
            </div>
          )}
        </div>

        {/* Create modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-heading font-bold text-ganpat-green">
                  Create New Course
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <form onSubmit={create} className="space-y-4">
                <div>
                  <label className="label">Course Title *</label>
                  <input
                    className="input"
                    required
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder="e.g. Data Structures"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Course Code *</label>
                    <input
                      className="input"
                      required
                      value={form.code}
                      onChange={(e) =>
                        setForm({ ...form, code: e.target.value.toUpperCase() })
                      }
                      placeholder="CS301"
                    />
                  </div>
                  <div>
                    <label className="label">Credits</label>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      className="input"
                      value={form.credits}
                      onChange={(e) =>
                        setForm({ ...form, credits: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Description *</label>
                  <textarea
                    className="input"
                    rows="3"
                    required
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Course overview…"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Semester</label>
                    <select
                      className="input"
                      value={form.semester}
                      onChange={(e) =>
                        setForm({ ...form, semester: e.target.value })
                      }
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>
                          Semester {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Max Students</label>
                    <input
                      type="number"
                      className="input"
                      value={form.maxStudents}
                      onChange={(e) =>
                        setForm({ ...form, maxStudents: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 btn-primary"
                  >
                    {saving ? "⏳ Creating…" : "Create Course"}
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
