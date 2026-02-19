import { connectDB } from '../../../lib/db'
import { signToken } from '../../../lib/auth'
import User from '../../../models/User'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })

  await connectDB()

  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  const user = await User.findOne({ email }).select('+password')
  if (!user) return res.status(401).json({ message: 'Invalid email or password' })

  const match = await user.matchPassword(password)
  if (!match) return res.status(401).json({ message: 'Invalid email or password' })

  if (!user.isActive) return res.status(401).json({ message: 'Account deactivated. Contact admin.' })

  user.lastLogin = new Date()
  await user.save({ validateBeforeSave: false })

  const token = signToken({ id: user._id, role: user.role })

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      enrollmentId: user.enrollmentId,
      department: user.department,
      semester: user.semester,
    },
  })
}
