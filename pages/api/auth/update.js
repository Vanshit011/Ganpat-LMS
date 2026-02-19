import { connectDB } from '../../../lib/db'
import { requireAuth } from '../../../lib/auth'
import User from '../../../models/User'
import bcrypt from 'bcryptjs'

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ message: 'Method not allowed' })

  const decoded = await requireAuth(req, res)
  if (!decoded) return

  await connectDB()

  const { name, phone, bio, department, currentPassword, newPassword } = req.body

  const user = await User.findById(decoded.id).select('+password')
  if (!user) return res.status(404).json({ message: 'User not found' })

  if (currentPassword && newPassword) {
    const match = await user.matchPassword(currentPassword)
    if (!match) return res.status(400).json({ message: 'Current password is incorrect' })
    user.password = newPassword
  }

  if (name) user.name = name
  if (phone !== undefined) user.phone = phone
  if (bio !== undefined) user.bio = bio
  if (department) user.department = department

  await user.save()

  res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department, phone: user.phone, bio: user.bio } })
}
