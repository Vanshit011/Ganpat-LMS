import nodemailer from 'nodemailer'

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

const LOGO_STYLE = `
  background: linear-gradient(135deg, #1a6b3a, #2EAD5C);
  padding: 24px 32px;
  text-align: center;
  border-radius: 12px 12px 0 0;
`

export async function sendWelcomeEmail({ name, email, role, enrollmentId }) {
  if (!process.env.EMAIL_USER) return   // silently skip if not configured

  const transporter = getTransporter()
  await transporter.sendMail({
    from: `"Ganpat University LMS" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🎓 Welcome to Ganpat University LMS',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
        <div style="${LOGO_STYLE}">
          <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700">🎓 Ganpat University</h1>
          <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:14px">Learning Management System</p>
        </div>
        <div style="padding:32px;background:#fff">
          <h2 style="color:#14532d;margin:0 0 8px">Welcome, ${name}! 🎉</h2>
          <p style="color:#374151">Your account is ready. Here are your details:</p>
          <div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:16px;border-radius:8px;margin:20px 0">
            <p style="margin:4px 0"><strong>Email:</strong> ${email}</p>
            <p style="margin:4px 0"><strong>Role:</strong> ${role.charAt(0).toUpperCase() + role.slice(1)}</p>
            ${enrollmentId ? `<p style="margin:4px 0"><strong>Enrollment ID:</strong> ${enrollmentId}</p>` : ''}
          </div>
          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login"
             style="display:inline-block;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">
            Login to LMS →
          </a>
        </div>
        <div style="padding:16px;text-align:center;background:#f9fafb;color:#9ca3af;font-size:12px">
          © ${new Date().getFullYear()} Ganpat University. All rights reserved.
        </div>
      </div>
    `,
  })
}

export async function sendAssignmentNotification({ studentEmail, studentName, assignmentTitle, courseTitle, dueDate, assignmentId }) {
  if (!process.env.EMAIL_USER) return

  const transporter = getTransporter()
  await transporter.sendMail({
    from: `"Ganpat University LMS" <${process.env.EMAIL_USER}>`,
    to: studentEmail,
    subject: `📝 New Assignment: ${assignmentTitle}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
        <div style="${LOGO_STYLE}">
          <h1 style="color:#fff;margin:0;font-size:22px">📝 New Assignment Posted</h1>
        </div>
        <div style="padding:32px;background:#fff">
          <p style="color:#374151">Hi <strong>${studentName}</strong>,</p>
          <p>A new assignment has been posted in <strong>${courseTitle}</strong>.</p>
          <div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:16px;border-radius:8px;margin:20px 0">
            <p style="margin:4px 0"><strong>Assignment:</strong> ${assignmentTitle}</p>
            <p style="margin:4px 0"><strong>Course:</strong> ${courseTitle}</p>
            <p style="margin:4px 0"><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString('en-IN', { dateStyle: 'full' })}</p>
          </div>
          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/assignments/${assignmentId}"
             style="display:inline-block;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600">
            View Assignment →
          </a>
        </div>
      </div>
    `,
  })
}
