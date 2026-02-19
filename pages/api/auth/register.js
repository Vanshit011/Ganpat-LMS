import { connectDB } from '../../../lib/db'
import { signToken } from '../../../lib/auth'
import { sendWelcomeEmail } from '../../../lib/email'
import User from '../../../models/User'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })

  await connectDB()

  const { name, email, password, role, department, semester } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' })
  }

  const existing = await User.findOne({ email })
  if (existing) return res.status(400).json({ message: 'Email already registered' })

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'student',
    department: department || 'Computer Science',
    semester: semester ? Number(semester) : undefined,
  })

  // Send welcome email (non-blocking)
  sendWelcomeEmail({ name: user.name, email: user.email, role: user.role, enrollmentId: user.enrollmentId }).catch(console.error)

  const token = signToken({ id: user._id, role: user.role })

  res.status(201).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      enrollmentId: user.enrollmentId,
      department: user.department,
    },
  })
}
