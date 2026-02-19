import { connectDB } from '../../../lib/db'
import { requireAuth } from '../../../lib/auth'
import Assignment from '../../../models/Assignment'

export default async function handler(req, res) {
  const decoded = await requireAuth(req, res)
  if (!decoded) return

  await connectDB()
  const { id } = req.query

  if (req.method === 'GET') {
    const assignment = await Assignment.findById(id)
      .populate('course', 'title code')
      .populate('faculty', 'name email')
      .populate('submissions.student', 'name email enrollmentId')
    if (!assignment) return res.status(404).json({ message: 'Not found' })
    return res.json({ assignment })
  }

  if (req.method === 'POST') {
    // Student submits
    const assignment = await Assignment.findById(id)
    if (!assignment) return res.status(404).json({ message: 'Not found' })

    const existing = assignment.submissions.find(s => s.student.toString() === decoded.id)
    if (existing) return res.status(400).json({ message: 'You have already submitted this assignment' })

    const isLate = new Date() > new Date(assignment.dueDate)
    assignment.submissions.push({
      student: decoded.id,
      content: req.body.content,
      status: isLate ? 'late' : 'submitted',
    })
    await assignment.save()

    return res.json({ message: isLate ? 'Submitted (late)' : 'Submitted successfully!' })
  }

  if (req.method === 'PUT') {
    // Faculty grades a submission
    const { studentId, grade, feedback } = req.body
    const assignment = await Assignment.findById(id)
    if (!assignment) return res.status(404).json({ message: 'Not found' })

    const sub = assignment.submissions.find(s => s.student.toString() === studentId)
    if (!sub) return res.status(404).json({ message: 'Submission not found' })

    sub.grade = Number(grade)
    sub.feedback = feedback
    sub.status = 'graded'
    await assignment.save()

    return res.json({ message: 'Graded successfully' })
  }

  res.status(405).json({ message: 'Method not allowed' })
}
