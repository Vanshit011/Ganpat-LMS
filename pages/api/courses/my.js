import { connectDB } from '../../../lib/db'
import { requireAuth } from '../../../lib/auth'
import Course from '../../../models/Course'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' })

  const decoded = await requireAuth(req, res)
  if (!decoded) return

  await connectDB()

  let courses
  if (decoded.role === 'faculty') {
    courses = await Course.find({ faculty: decoded.id }).populate('faculty', 'name email').sort('-createdAt')
  } else {
    courses = await Course.find({ enrolledStudents: decoded.id }).populate('faculty', 'name email').sort('-createdAt')
  }

  res.json({ courses })
}
