import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import { useAuth } from '../_app'
import Layout from '../../components/Layout'
import toast from 'react-hot-toast'

const TYPE_ICON  = { assignment:'📝', project:'🏗️', lab:'🔬' }
const TYPE_BADGE = { assignment:'badge-blue', project:'badge-purple', lab:'badge-green' }

export default function Assignments() {
  const { user, api, loading: authLoading } = useAuth()
  const router = useRouter()
  const [assignments, setAssignments] = useState([])
  const [courses, setCourses]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState('all')
  const [showForm, setShowForm]       = useState(false)
  const [saving, setSaving]           = useState(false)
  const [form, setForm]               = useState({
    title:'', description:'', course:'', dueDate:'', totalMarks:'100', type:'assignment',
  })

  useEffect(() => { if (!authLoading && !user) router.replace('/login') }, [user, authLoading])

  const load = async () => {
    try {
      const [a, c] = await Promise.all([api('/api/assignments'), api('/api/courses/my')])
      setAssignments(a.assignments || [])
      setCourses(c.courses || [])
    } catch {} finally { setLoading(false) }
  }
  useEffect(() => { if (user) load() }, [user])

  const create = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api('/api/assignments', { method:'POST', body: form })
      toast.success('Assignment created! Students notified 📧')
      setShowForm(false); load()
    } catch (err) { toast.error(err.message) } finally { setSaving(false) }
  }

  const daysLeft = (d) => Math.ceil((new Date(d) - new Date()) / 86400000)

  const filtered = assignments.filter(a => {
    const mine = a.submissions?.find(s => s.student === user?.id || s.student?._id === user?.id)
    if (filter === 'pending')   return !mine && daysLeft(a.dueDate) > 0
    if (filter === 'submitted') return !!mine
    if (filter === 'overdue')   return !mine && daysLeft(a.dueDate) <= 0
    return true
  })

  if (!user) return null

  return (
    <>
      <Head><title>Assignments – Ganpat LMS</title></Head>
      <Layout title="📝 Assignments">
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-sm text-gray-400">{assignments.length} total</p>
            {user.role !== 'student' && (
              <button onClick={() => setShowForm(true)} className="btn-primary">+ Create Assignment</button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 flex-wrap">
            {['all','pending','submitted','overdue'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all
                  ${filter === f ? 'bg-ganpat-green text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300'}`}>
                {f}
              </button>
            ))}
          </div>

          {/* List */}
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card h-20 animate-pulse bg-gray-50" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="card text-center py-14">
              <p className="text-5xl mb-3">📝</p>
              <p className="text-gray-400 font-medium">No assignments found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(a => {
                const dl  = daysLeft(a.dueDate)
                const mine = a.submissions?.find(s => s.student === user.id || s.student?._id === user.id)
                const isOv = dl <= 0 && !mine
                return (
                  <Link href={`/assignments/${a._id}`} key={a._id}
                    className={`card flex flex-col sm:flex-row sm:items-center gap-4 border-l-4 block
                      ${isOv ? 'border-red-400' : dl <= 2 ? 'border-orange-400' : 'border-ganpat-green'}`}>
                    <span className="text-3xl flex-shrink-0">{TYPE_ICON[a.type] || '📝'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-2 items-center mb-1">
                        <span className="font-semibold text-sm text-gray-800">{a.title}</span>
                        <span className={`badge ${TYPE_BADGE[a.type] || 'badge-gray'}`}>{a.type}</span>
                        {mine && (
                          <span className={`badge ${mine.grade !== undefined ? 'badge-green' : 'badge-yellow'}`}>
                            {mine.grade !== undefined ? `${mine.grade}/${a.totalMarks}` : 'Submitted'}
                          </span>
                        )}
                        {isOv && <span className="badge badge-red">Overdue</span>}
                      </div>
                      <p className="text-xs text-gray-400">{a.course?.title} · {a.course?.code}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-sm text-gray-800">{a.totalMarks} marks</p>
                      <p className={`text-xs mt-0.5 font-medium ${isOv ? 'text-red-500' : dl <= 2 ? 'text-orange-500' : 'text-gray-400'}`}>
                        {isOv ? '❌ Overdue' : `${dl}d left`}
                      </p>
                      <p className="text-xs text-gray-300">{new Date(a.dueDate).toLocaleDateString('en-IN')}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-heading font-bold text-ganpat-green">Create Assignment</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 text-2xl">×</button>
              </div>
              <form onSubmit={create} className="space-y-4">
                <div>
                  <label className="label">Title *</label>
                  <input className="input" required value={form.title}
                    onChange={e => setForm({...form, title: e.target.value})} placeholder="Assignment title…" />
                </div>
                <div>
                  <label className="label">Course *</label>
                  <select className="input" required value={form.course}
                    onChange={e => setForm({...form, course: e.target.value})}>
                    <option value="">Select a course</option>
                    {courses.map(c => <option key={c._id} value={c._id}>{c.title} ({c.code})</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Description *</label>
                  <textarea className="input" rows="3" required value={form.description}
                    onChange={e => setForm({...form, description: e.target.value})}
                    placeholder="Instructions, requirements…" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Due Date *</label>
                    <input type="datetime-local" className="input" required value={form.dueDate}
                      onChange={e => setForm({...form, dueDate: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">Total Marks</label>
                    <input type="number" className="input" value={form.totalMarks}
                      onChange={e => setForm({...form, totalMarks: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="label">Type</label>
                  <select className="input" value={form.type}
                    onChange={e => setForm({...form, type: e.target.value})}>
                    {['assignment','project','lab'].map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn-outline">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 btn-primary">
                    {saving ? '⏳ Creating…' : '📧 Create & Notify'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Layout>
    </>
  )
}
