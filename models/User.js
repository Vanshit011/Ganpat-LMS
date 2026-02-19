import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['student', 'faculty', 'admin'], default: 'student' },
  enrollmentId: { type: String, unique: true, sparse: true },
  department: { type: String, default: 'Computer Science' },
  semester: { type: Number, min: 1, max: 8 },
  phone: String,
  bio: String,
  isActive: { type: Boolean, default: true },
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  lastLogin: Date,
}, { timestamps: true })

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

UserSchema.pre('save', function (next) {
  if (!this.enrollmentId && this.role === 'student') {
    this.enrollmentId = 'GUNI' + Date.now().toString().slice(-6)
  }
  next()
})

UserSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password)
}

export default mongoose.models.User || mongoose.model('User', UserSchema)
