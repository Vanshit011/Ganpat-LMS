import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from './_app'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      router.replace(user ? '/dashboard' : '/login')
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-ganpat-off-white">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-green-200 border-t-ganpat-green rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 font-medium">Loading Ganpat LMS…</p>
      </div>
    </div>
  )
}
