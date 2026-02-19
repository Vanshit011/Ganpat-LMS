import { connectDB } from '../../../lib/db'
import { requireAuth } from '../../../lib/auth'
import Course from '../../../models/Course'
import User from '../../../models/User'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })

  const decoded = await requireAuth(req, res)
  if (!decoded) return

  await connectDB()

  const { id } = req.query
  const course = await Course.findById(id)
  if (!course) return res.status(404).json({ message: 'Course not found' })

  if (course.enrolledStudents.includes(decoded.id)) {
    return res.status(400).json({ message: 'Already enrolled in this course' })
  }
  if (course.enrolledStudents.length >= course.maxStudents) {
    return res.status(400).json({ message: 'Course is full' })
  }

  course.enrolledStudents.push(decoded.id)
  await course.save()

  await User.findByIdAndUpdate(decoded.id, { $addToSet: { enrolledCourses: id } })

  res.json({ message: 'Enrolled successfully', course })
}
