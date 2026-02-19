import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from './_app'
import Head from 'next/head'
import toast from 'react-hot-toast'

const DEPARTMENTS = [
  'Computer Science','Information Technology','Electronics','Mechanical',
  'Civil','Chemical','MBA','MCA','BBA','BCA',
]

export default function Register() {
  const { login, api } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '',
    role: 'student', department: 'Computer Science', semester: '1',
  })
  const [show, setShow]     = useState(false)
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) return toast.error('Passwords do not match')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')

    setLoading(true)
    try {
      const data = await api('/api/auth/register', {
        method: 'POST',
        body: {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          department: form.department,
          semester: form.role === 'student' ? form.semester : undefined,
        },
      })
      login(data.token, data.user)
      toast.success('Account created! Welcome 🎉')
      router.push('/dashboard')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head><title>Register – Ganpat University LMS</title></Head>
      <div className="min-h-screen flex items-center justify-center bg-ganpat-off-white p-6">
        <div className="w-full max-w-xl animate-fade-in">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow"
                 style={{ background: 'linear-gradient(135deg,#1a6b3a,#2EAD5C)' }}>GU</div>
            <div>
              <h1 className="font-heading font-bold text-ganpat-green">Create Account</h1>
              <p className="text-xs text-gray-400">Ganpat University LMS Registration</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-green-100 p-8">
            <form onSubmit={handle} className="space-y-5">
              <div>
                <label className="label">Full Name *</label>
                <input className="input" placeholder="Your full name" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>

              <div>
                <label className="label">Email Address *</label>
                <input type="email" className="input" placeholder="you@example.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Password *</label>
                  <div className="relative">
                    <input type={show ? 'text' : 'password'} className="input pr-10" placeholder="Min. 6 chars"
                      value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
                      onClick={() => setShow(!show)}>{show ? '🙈' : '👁️'}</button>
                  </div>
                </div>
                <div>
                  <label className="label">Confirm Password *</label>
                  <input type="password" className="input" placeholder="Repeat password"
                    value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Role *</label>
                  <select className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                  </select>
                </div>
                <div>
                  <label className="label">Department *</label>
                  <select className="input" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {form.role === 'student' && (
                <div>
                  <label className="label">Current Semester</label>
                  <select className="input" value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })}>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
              )}

              <div className="flex items-start gap-2 pt-1">
                <input type="checkbox" id="terms" className="mt-0.5 accent-ganpat-green" required />
                <label htmlFor="terms" className="text-xs text-gray-500">
                  I agree to the <span className="text-ganpat-green font-medium">Terms of Service</span> and <span className="text-ganpat-green font-medium">Privacy Policy</span>
                </label>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? '⏳ Creating account…' : '🎓 Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-5">
              Already have an account?{' '}
              <Link href="/login" className="text-ganpat-green font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
