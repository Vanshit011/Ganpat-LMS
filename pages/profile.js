import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useAuth } from './_app'
import Layout from '../components/Layout'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, api, updateUser, loading: authLoading } = useAuth()
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [form, setForm]       = useState({ name:'', phone:'', bio:'', department:'' })
  const [pwForm, setPwForm]   = useState({ currentPassword:'', newPassword:'', confirm:'' })
  const [saving, setSaving]   = useState(false)

  useEffect(() => { if (!authLoading && !user) router.replace('/login') }, [user, authLoading])
  useEffect(() => {
    if (user) setForm({ name: user.name||'', phone: user.phone||'', bio: user.bio||'', department: user.department||'' })
  }, [user])

  const saveProfile = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const d = await api('/api/auth/update', { method:'PUT', body: form })
      updateUser({ ...user, ...d.user })
      toast.success('Profile updated!'); setEditing(false)
    } catch (err) { toast.error(err.message) } finally { setSaving(false) }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match')
    if (pwForm.newPassword.length < 6) return toast.error('Min 6 characters')
    try {
      await api('/api/auth/update', { method:'PUT', body: { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword } })
      toast.success('Password changed!'); setPwForm({ currentPassword:'', newPassword:'', confirm:'' })
    } catch (err) { toast.error(err.message) }
  }

  if (!user) return null

  const roleColor = { student:'badge-green', faculty:'badge-orange', admin:'badge-purple' }

  return (
    <>
      <Head><title>Profile – Ganpat LMS</title></Head>
      <Layout title="👤 Profile">
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          {/* Profile card */}
          <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-6">
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-white font-bold text-4xl shadow-md flex-shrink-0"
                   style={{ background: 'linear-gradient(135deg,#14532d,#2EAD5C)' }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-heading font-bold text-gray-800">{user.name}</h2>
                <p className="text-gray-400 text-sm">{user.email}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className={`badge ${roleColor[user.role]}`}>{user.role}</span>
                  {user.enrollmentId && <span className="badge badge-blue font-mono">{user.enrollmentId}</span>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                ['Department', user.department || '—'],
                ['Semester',   user.semester   || '—'],
                ['Phone',      user.phone      || '—'],
                ['Joined',     new Date(user.createdAt||Date.now()).getFullYear()],
              ].map(([k,v]) => (
                <div key={k} className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="font-bold text-sm text-gray-800">{v}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{k}</p>
                </div>
              ))}
            </div>

            {user.bio && <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4 mb-4">{user.bio}</p>}

            <button onClick={() => setEditing(!editing)}
              className={editing ? 'btn-outline' : 'btn-primary'}>
              {editing ? '✕ Cancel' : '✏️ Edit Profile'}
            </button>
          </div>

          {/* Edit form */}
          {editing && (
            <div className="card animate-slide-up">
              <h3 className="font-heading font-bold text-ganpat-green mb-4">Edit Profile</h3>
              <form onSubmit={saveProfile} className="space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input className="input" placeholder="+91 XXXXX XXXXX" value={form.phone}
                    onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
                <div>
                  <label className="label">Department</label>
                  <input className="input" value={form.department}
                    onChange={e => setForm({...form, department: e.target.value})} />
                </div>
                <div>
                  <label className="label">Bio</label>
                  <textarea className="input" rows="3" placeholder="Tell us about yourself…"
                    value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} />
                </div>
                <button type="submit" disabled={saving} className="btn-primary w-full">
                  {saving ? '⏳ Saving…' : '💾 Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* Change password */}
          <div className="card">
            <h3 className="font-heading font-bold text-ganpat-green mb-4">🔒 Change Password</h3>
            <form onSubmit={changePassword} className="space-y-4">
              <div>
                <label className="label">Current Password</label>
                <input type="password" className="input" value={pwForm.currentPassword}
                  onChange={e => setPwForm({...pwForm, currentPassword: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">New Password</label>
                  <input type="password" className="input" placeholder="Min. 6 chars" value={pwForm.newPassword}
                    onChange={e => setPwForm({...pwForm, newPassword: e.target.value})} required />
                </div>
                <div>
                  <label className="label">Confirm New</label>
                  <input type="password" className="input" value={pwForm.confirm}
                    onChange={e => setPwForm({...pwForm, confirm: e.target.value})} required />
                </div>
              </div>
              <button type="submit" className="btn-primary">🔐 Update Password</button>
            </form>
          </div>
        </div>
      </Layout>
    </>
  )
}
