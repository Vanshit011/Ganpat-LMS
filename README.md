# Ganpat University LMS (Learning Management System)

A premium, full-stack Learning Management System built for Ganpat University's final year project.

## 🚀 Features

- **Modern Ganpat Theme**: Green & White brand identity with Glassmorphism UI.
- **Role-Based Dashboards**: Customized views for Students, Faculty, and Admins.
- **Course Management**: Detailed course views with Materials and Assignments.
- **Assignment System**: Create, track, and submit assignments.
- **Responsive Design**: Works perfectly on Mobile, Tablet, and Desktop.

## 🛠️ Tech Stack

- **Frontend**: Next.js, Tailwind CSS
- **Backend**: Next.js API Routes (Node.js)
- **Database**: MongoDB Atlas
- **Authentication**: JWT & Bcrypt

## ⚙️ Local Setup

1. Clone the repository.
2. Install dependencies: `npm install`
3. Create a `.env.local` file with:
   ```env
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=any_random_string
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=your_gmail_app_password
   ```
4. Run the development server: `npm run dev`
5. Visit `http://localhost:3000`

## ☁️ Vercel Deployment

1. Connect this repo to [Vercel](https://vercel.com).
2. Add the Environment Variables from your `.env.local` to the Vercel Project Settings.
3. Deploy!

---

Developed as a complete full-stack solution for Ganpat University.
