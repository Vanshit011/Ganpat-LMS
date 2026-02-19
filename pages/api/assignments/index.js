import { connectDB } from '../../../lib/db'
import { requireAuth } from '../../../lib/auth'
import Assignment from '../../../models/Assignment'
import Course from '../../../models/Course'
import User from '../../../models/User'
import { sendAssignmentNotification } from '../../../lib/email'

export default async function handler(req, res) {
  const decoded = await requireAuth(req, res)
  if (!decoded) return

  await connectDB()

  if (req.method === 'GET') {
    let assignments
    if (decoded.role === 'faculty' || decoded.role === 'admin') {
      assignments = await Assignment.find({ faculty: decoded.id })
        .populate('course', 'title code')
        .sort('-createdAt')
    } else {
      const user = await User.findById(decoded.id)
      assignments = await Assignment.find({
        course: { $in: user.enrolledCourses },
        isVisible: true,
      }).populate('course', 'title code').sort('-createdAt')
    }
    return res.json({ assignments })
  }

  if (req.method === 'POST') {
    if (!['faculty', 'admin'].includes(decoded.role)) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    const { title, description, course, dueDate, totalMarks, type } = req.body
    if (!title || !description || !course || !dueDate) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const assignment = await Assignment.create({
      title,
      description,
      course,
      dueDate,
      totalMarks: Number(totalMarks) || 100,
      type: type || 'assignment',
      faculty: decoded.id,
    })

    // Notify enrolled students by email (non-blocking)
    const courseDoc = await Course.findById(course).populate('enrolledStudents', 'name email')
    if (courseDoc) {
      courseDoc.enrolledStudents.forEach(student => {
        sendAssignmentNotification({
          studentEmail: student.email,
          studentName: student.name,
          assignmentTitle: title,
          courseTitle: courseDoc.title,
          dueDate,
          assignmentId: assignment._id,
        }).catch(console.error)
      })
    }

    return res.status(201).json({ assignment })
  }

  res.status(405).json({ message: 'Method not allowed' })
}
