import { connectDB } from '../../../lib/db'
import { requireAuth } from '../../../lib/auth'
import User from '../../../models/User'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' })

  const decoded = await requireAuth(req, res)
  if (!decoded) return

  await connectDB()

  const user = await User.findById(decoded.id)
    .populate('enrolledCourses', 'title code')
    .select('-password')

  if (!user) return res.status(404).json({ message: 'User not found' })

  res.json({ user })
}
