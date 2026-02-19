import mongoose from 'mongoose'

const SubmissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: String,
  fileUrl: String,
  submittedAt: { type: Date, default: Date.now },
  grade: { type: Number, min: 0, max: 100 },
  feedback: String,
  status: { type: String, enum: ['submitted', 'graded', 'late'], default: 'submitted' },
})

const AssignmentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dueDate: { type: Date, required: true },
  totalMarks: { type: Number, default: 100 },
  type: { type: String, enum: ['assignment', 'project', 'lab'], default: 'assignment' },
  submissions: [SubmissionSchema],
  isVisible: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.models.Assignment || mongoose.model('Assignment', AssignmentSchema)
