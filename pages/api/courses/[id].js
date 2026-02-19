import { connectDB } from "../../../lib/db";
import { requireAuth } from "../../../lib/auth";
import Course from "../../../models/Course";
import Assignment from "../../../models/Assignment";

export default async function handler(req, res) {
  await connectDB();
  const { id } = req.query;

  if (req.method === "GET") {
    const [course, assignments] = await Promise.all([
      Course.findById(id)
        .populate("faculty", "name email bio")
        .populate("enrolledStudents", "name email enrollmentId"),
      Assignment.find({ course: id }).select(
        "title dueDate type submissions totalMarks",
      ),
    ]);

    if (!course) return res.status(404).json({ message: "Course not found" });
    return res.json({ course, assignments });
  }

  const decoded = await requireAuth(req, res);
  if (!decoded) return;

  if (req.method === "PUT") {
    const course = await Course.findByIdAndUpdate(id, req.body, { new: true });
    if (!course) return res.status(404).json({ message: "Not found" });
    return res.json({ course });
  }

  if (req.method === "DELETE") {
    await Course.findByIdAndDelete(id);
    return res.json({ message: "Deleted" });
  }

  res.status(405).json({ message: "Method not allowed" });
}
