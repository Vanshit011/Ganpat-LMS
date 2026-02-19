import mongoose from 'mongoose'

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  description: { type: String, required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department: { type: String, required: true },
  semester: { type: Number, required: true, min: 1, max: 8 },
  credits: { type: Number, default: 4 },
  maxStudents: { type: Number, default: 60 },
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  materials: [{
    title: String,
    type: { type: String, enum: ['pdf', 'video', 'link', 'doc'] },
    url: String,
    uploadedAt: { type: Date, default: Date.now },
  }],
  schedule: {
    days: [String],
    time: String,
    room: String,
  },
  isActive: { type: Boolean, default: true },
  academicYear: { type: String, default: '2024-25' },
}, { timestamps: true })

export default mongoose.models.Course || mongoose.model('Course', CourseSchema)
