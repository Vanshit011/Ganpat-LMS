import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../pages/_app'
import toast from 'react-hot-toast'

const NAV = [
  { href: '/dashboard',   label: 'Dashboard',   icon: '🏠', roles: ['student','faculty','admin'] },
  { href: '/courses',     label: 'Courses',      icon: '📚', roles: ['student','faculty','admin'] },
  { href: '/assignments', label: 'Assignments',  icon: '📝', roles: ['student','faculty','admin'] },
  { href: '/profile',     label: 'Profile',      icon: '👤', roles: ['student','faculty','admin'] },
]

function Avatar({ name, size = 'md' }) {
  const initials = name?.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() || '?'
  const sz = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-xl' }
  return (
    <div className={`${sz[size]} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
         style={{ background: 'linear-gradient(135deg,#1a6b3a,#2EAD5C)' }}>
      {initials}
    </div>
  )
}

export default function Layout({ children, title = '' }) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    router.push('/login')
  }

  const filteredNav = NAV.filter(n => n.roles.includes(user?.role))

  return (
    <div className="flex h-screen overflow-hidden bg-ganpat-off-white">
      {/* ── Sidebar ── */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col
        bg-white border-r border-green-100 shadow-sm
        transform transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-green-50">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shadow"
               style={{ background: 'linear-gradient(135deg,#1a6b3a,#2EAD5C)' }}>
            GU
          </div>
          <div>
            <p className="font-heading font-bold text-ganpat-green text-sm leading-tight">Ganpat University</p>
            <p className="text-xs text-gray-400">LMS Portal</p>
          </div>
        </div>

        {/* User chip */}
        <div className="mx-4 mt-4 p-3 rounded-2xl bg-green-50 border border-green-100">
          <div className="flex items-center gap-3">
            <Avatar name={user?.name} size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
              <span className={`badge text-xs ${user?.role === 'admin' ? 'badge-purple' : user?.role === 'faculty' ? 'badge-orange' : 'badge-green'}`}>
                {user?.role}
              </span>
            </div>
          </div>
          {user?.enrollmentId && (
            <p className="text-xs text-gray-400 mt-1.5 font-mono">{user.enrollmentId}</p>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {filteredNav.map(n => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
              className={`nav-link ${router.pathname.startsWith(n.href) ? 'active' : ''}`}>
              <span className="text-base">{n.icon}</span>
              <span>{n.label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 pb-5 border-t border-green-50 pt-4">
          <button onClick={handleLogout} className="nav-link w-full text-left text-red-500 hover:bg-red-50 hover:text-red-600">
            <span>🚪</span><span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {open && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-green-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 rounded-lg hover:bg-green-50 text-gray-600" onClick={() => setOpen(!open)}>
              ☰
            </button>
            <div>
              {title && <h1 className="text-lg font-bold text-ganpat-green font-heading">{title}</h1>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs text-gray-400">
              {new Date().toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short', year:'numeric' })}
            </span>
            <Link href="/profile">
              <Avatar name={user?.name} size="sm" />
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export { Avatar }
