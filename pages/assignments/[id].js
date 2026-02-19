import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useAuth } from '../_app'
import Layout from '../../components/Layout'
import toast from 'react-hot-toast'

export default function AssignmentDetail() {
  const { user, api, loading: authLoading } = useAuth()
  const router  = useRouter()
  const { id }  = router.query
  const [assignment, setAssignment] = useState(null)
  const [loading, setLoading]       = useState(true)
  const [content, setContent]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [grading, setGrading]       = useState({})

  useEffect(() => { if (!authLoading && !user) router.replace('/login') }, [user, authLoading])

  const load = async () => {
    if (!id) return
    try {
      const d = await api(`/api/assignments/${id}`)
      setAssignment(d.assignment)
    } catch { toast.error('Assignment not found'); router.push('/assignments') }
    finally { setLoading(false) }
  }
  useEffect(() => { if (user && id) load() }, [user, id])

  const submit = async () => {
    if (!content.trim()) return toast.error('Please write your answer first')
    setSubmitting(true)
    try {
      const d = await api(`/api/assignments/${id}`, { method:'POST', body: { content } })
      toast.success(d.message); load()
    } catch (err) { toast.error(err.message) } finally { setSubmitting(false) }
  }

  const grade = async (studentId) => {
    const g = grading[studentId]
    if (!g?.grade) return toast.error('Enter a grade first')
    try {
      await api(`/api/assignments/${id}`, { method:'PUT', body: { studentId, grade: g.grade, feedback: g.feedback } })
      toast.success('Graded!'); load()
    } catch (err) { toast.error(err.message) }
  }

  if (!user || loading) return (
    <Layout title="Assignment">
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-green-200 border-t-ganpat-green rounded-full animate-spin" />
      </div>
    </Layout>
  )
  if (!assignment) return null

  const mySubmission  = assignment.submissions?.find(s => s.student?._id === user.id || s.student === user.id)
  const daysLeft      = Math.ceil((new Date(assignment.dueDate) - new Date()) / 86400000)
  const isOverdue     = daysLeft <= 0

  return (
    <>
      <Head><title>{assignment.title} – Ganpat LMS</title></Head>
      <Layout title="">
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          <button onClick={() => router.push('/assignments')} className="btn-ghost text-sm">← Back to Assignments</button>

          {/* Header card */}
          <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
              <div>
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="badge badge-green capitalize">{assignment.type}</span>
                  {isOverdue && !mySubmission && <span className="badge badge-red">Overdue</span>}
                  {mySubmission && (
                    <span className={`badge ${mySubmission.grade !== undefined ? 'badge-green' : 'badge-yellow'}`}>
                      {mySubmission.grade !== undefined ? `Graded: ${mySubmission.grade}/${assignment.totalMarks}` : '✅ Submitted'}
                    </span>
                  )}
                </div>
                <h1 className="text-xl font-heading font-bold text-gray-800">{assignment.title}</h1>
                <p className="text-sm text-gray-400 mt-1">{assignment.course?.title} · {assignment.course?.code}</p>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center flex-shrink-0">
                <p className="text-3xl font-bold text-ganpat-green">{assignment.totalMarks}</p>
                <p className="text-xs text-gray-400">Total Marks</p>
                <p className={`text-xs font-medium mt-1 ${isOverdue ? 'text-red-500' : daysLeft <= 2 ? 'text-orange-500' : 'text-gray-400'}`}>
                  {isOverdue ? '❌ Overdue' : `${daysLeft} days left`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 text-sm">
              {[
                ['Faculty', assignment.faculty?.name],
                ['Due Date', new Date(assignment.dueDate).toLocaleDateString('en-IN')],
                ['Submissions', assignment.submissions?.length || 0],
                ['Posted', new Date(assignment.createdAt).toLocaleDateString('en-IN')],
              ].map(([k,v]) => (
                <div key={k} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">{k}</p>
                  <p className="font-semibold text-gray-800 mt-0.5">{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="card">
            <h2 className="font-heading font-bold text-gray-800 mb-3">📋 Description</h2>
            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{assignment.description}</p>
          </div>

          {/* Student – Submit */}
          {user.role === 'student' && (
            <div className="card">
              <h2 className="font-heading font-bold text-gray-800 mb-4">
                {mySubmission ? '✅ My Submission' : '📤 Submit Assignment'}
              </h2>

              {mySubmission ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-sm text-ganpat-green font-semibold">
                      Submitted on {new Date(mySubmission.submittedAt).toLocaleString('en-IN')}
                      {mySubmission.status === 'late' && <span className="text-orange-500 ml-2">(Late)</span>}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{mySubmission.content}</p>
                  </div>
                  {mySubmission.grade !== undefined && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-4xl font-bold text-ganpat-green">
                            {mySubmission.grade}<span className="text-lg text-gray-400">/{assignment.totalMarks}</span>
                          </p>
                          <p className="text-xs text-gray-400">Your Score</p>
                        </div>
                        <div className="flex-1">
                          <div className="progress">
                            <div className="progress-bar" style={{ width: `${(mySubmission.grade/assignment.totalMarks)*100}%` }} />
                          </div>
                          <p className="text-xs text-right text-gray-400 mt-1">
                            {Math.round((mySubmission.grade/assignment.totalMarks)*100)}%
                          </p>
                        </div>
                      </div>
                      {mySubmission.feedback && (
                        <div className="mt-3 bg-white rounded-xl p-3">
                          <p className="text-xs text-gray-400 mb-1">Feedback from faculty:</p>
                          <p className="text-sm text-gray-700">{mySubmission.feedback}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <textarea className="input" rows={8} placeholder="Write your solution here…"
                    value={content} onChange={e => setContent(e.target.value)} />
                  {isOverdue && (
                    <p className="text-orange-500 text-sm">⚠️ This assignment is overdue. Late submissions may be penalised.</p>
                  )}
                  <button onClick={submit} disabled={submitting} className="btn-primary w-full py-3">
                    {submitting ? '⏳ Submitting…' : '📤 Submit Assignment'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Faculty – Submissions */}
          {user.role !== 'student' && (
            <div className="card">
              <h2 className="font-heading font-bold text-gray-800 mb-4">
                👥 Submissions ({assignment.submissions?.length || 0})
              </h2>
              {!assignment.submissions?.length ? (
                <p className="text-gray-400 text-center py-8">No submissions yet</p>
              ) : (
                <div className="space-y-5">
                  {assignment.submissions.map(sub => (
                    <div key={sub._id} className="border border-green-100 rounded-2xl p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                               style={{ background: 'linear-gradient(135deg,#1a6b3a,#2EAD5C)' }}>
                            {sub.student?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-gray-800">{sub.student?.name}</p>
                            <p className="text-xs text-gray-400">
                              {sub.student?.enrollmentId} · {new Date(sub.submittedAt).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                        </div>
                        <span className={`badge ${sub.grade !== undefined ? 'badge-green' : sub.status === 'late' ? 'badge-red' : 'badge-yellow'}`}>
                          {sub.grade !== undefined ? `${sub.grade}/${assignment.totalMarks}` : sub.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 mb-4">{sub.content}</p>
                      <div className="grid sm:grid-cols-3 gap-3">
                        <input type="number" className="input" min="0" max={assignment.totalMarks}
                          placeholder={`Grade (0–${assignment.totalMarks})`}
                          value={grading[sub.student?._id]?.grade || ''}
                          onChange={e => setGrading({...grading, [sub.student?._id]: {...grading[sub.student?._id], grade: e.target.value}})} />
                        <input className="input" placeholder="Feedback (optional)"
                          value={grading[sub.student?._id]?.feedback || ''}
                          onChange={e => setGrading({...grading, [sub.student?._id]: {...grading[sub.student?._id], feedback: e.target.value}})} />
                        <button onClick={() => grade(sub.student?._id)} className="btn-primary text-sm">
                          {sub.grade !== undefined ? '✏️ Update Grade' : '✅ Grade'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Layout>
    </>
  )
}
