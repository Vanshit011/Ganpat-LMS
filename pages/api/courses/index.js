import { connectDB } from '../../../lib/db'
import { requireAuth } from '../../../lib/auth'
import Course from '../../../models/Course'
import User from '../../../models/User'

export default async function handler(req, res) {
  await connectDB()

  if (req.method === 'GET') {
    // Public – list courses
    const { search, semester, department, mine } = req.query

    const filter = { isActive: true }
    if (semester) filter.semester = Number(semester)
    if (department) filter.department = department
    if (search) filter.title = { $regex: search, $options: 'i' }

    const courses = await Course.find(filter)
      .populate('faculty', 'name email')
      .sort('-createdAt')

    return res.json({ courses })
  }

  if (req.method === 'POST') {
    const decoded = await requireAuth(req, res)
    if (!decoded) return

    if (!['faculty', 'admin'].includes(decoded.role)) {
      return res.status(403).json({ message: 'Only faculty can create courses' })
    }

    const { title, code, description, department, semester, credits, maxStudents } = req.body

    if (!title || !code || !description || !department || !semester) {
      return res.status(400).json({ message: 'All required fields must be provided' })
    }

    const course = await Course.create({
      title,
      code: code.toUpperCase(),
      description,
      department,
      semester: Number(semester),
      credits: Number(credits) || 4,
      maxStudents: Number(maxStudents) || 60,
      faculty: decoded.id,
    })

    return res.status(201).json({ course })
  }

  res.status(405).json({ message: 'Method not allowed' })
}
