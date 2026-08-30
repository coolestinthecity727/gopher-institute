# Gopher Institute Foundation — College Administration & Online Application Platform

A full-stack web platform for **Gopher Institute Foundation**, a technical & vocational training
college in Zimbabwe, built in partnership with the Ministry of Vocational Training and Youth
Empowerment.

Built with **Next.js 14 (App Router)**, **Prisma**, and **Tailwind CSS**. Ships with a SQLite
database for instant local setup — swap the `DATABASE_URL` to point at Postgres/MySQL for
production with no code changes.

## Features

**Public site**
- Home, About, Programmes (15 vocational courses across 6 categories)
- **Online Application** — students apply for any programme and receive a reference number
- **Certificate Authentication Portal** — anyone (e.g. employers) can verify a certificate is genuine
- **Registration Check** — current students, alumni, and applicants can check their status
- **News & Events** — announcements, open days, graduation ceremonies
- **Partnership Corner** — the Ministry partnership plus industry/community partners
- Contact form

**Student portal** (`/student/dashboard`)
- View enrollment details and issued certificates
- Self-service account creation once enrolled (linked by student number)

**Admin panel** (`/admin`)
- Dashboard overview with key stats
- Review & progress applications (Pending → Under Review → Accepted/Rejected → Enrolled)
- Manage students (status, graduation, records)
- Manage programmes (add/edit/retire courses)
- Issue & revoke certificates (auto-generates certificate number + verification code)
- Manage News & Events posts
- Manage Partnerships
- Review contact messages

Role-based access (`SUPER_ADMIN`, `ADMIN`, `REGISTRAR`, `STUDENT`) is enforced both in the UI and
at the API layer, plus route-level middleware protecting `/admin/*` and `/student/*`.

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — at minimum set a real JWT_SECRET

# 3. Create the database and load starter data
npm run db:push
npm run db:seed

# 4. Run it
npm run dev
```

Visit `http://localhost:3000`.

### Default accounts (created by the seed script)

| Role  | Email | Password |
|-------|-------|----------|
| Super Admin | `admin@gopherinstitute.ac.zw` (or your `SEED_ADMIN_EMAIL`) | `ChangeMe123!` (or your `SEED_ADMIN_PASSWORD`) |
| Sample Alumnus | `sample.student@gopherinstitute.ac.zw` | `Student123!` |

**Change these immediately in any real deployment.** Set `SEED_ADMIN_EMAIL` /
`SEED_ADMIN_PASSWORD` in `.env` before seeding to choose your own.

Sample data for testing the public portals:
- Certificate number: `GIF-CERT-2024-0001` (verification portal)
- Student number: `GIF-2024-0001` (registration check / student login registration)

## Moving to production

1. **Database**: create a Postgres database (Railway, Supabase, Neon, RDS, etc.), then in
   `prisma/schema.prisma` change:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
   Update `DATABASE_URL` in your environment, then run `npm run db:push` and `npm run db:seed`.
2. **Secrets**: set a long random `JWT_SECRET`.
3. **Deploy**: this is a standard Next.js app — deploy to Vercel, Railway, Render, or any Node
   host. Run `npm run build && npm start` (or the platform's Next.js preset).
4. **File uploads / images**: course, event and partner "image" fields currently take a URL
   string. Wire up an object storage provider (S3, Cloudinary, etc.) if you want direct image
   uploads from the admin panel.
5. **Email**: application confirmations and status-change notifications aren't wired to an email
   provider yet — add one (Resend, SendGrid, etc.) in `src/app/api/applications/route.ts` and
   `src/app/api/applications/[id]/route.ts` if you'd like automatic emails.

## Project structure

```
prisma/schema.prisma        Database models (User, Course, Application, Student, Certificate,
                             Post, Partner, ContactMessage)
prisma/seed.js               Starter data: courses, admin user, Ministry partnership, sample posts
src/lib/                     Prisma client, auth (JWT/bcrypt), ID generators
src/middleware.ts            Route protection for /admin and /student
src/components/              Navbar, Footer
src/app/                     Public pages (courses, apply, verify-certificate, check-registration,
                              events, partners, about, contact, login)
src/app/student/dashboard/   Student portal
src/app/admin/               Admin panel (overview + 7 management screens)
src/app/api/                 All REST endpoints backing the above
```

## Notes on this build

- Passwords are hashed with bcrypt; sessions are signed JWTs in an httpOnly cookie — no
  third-party auth dependency required.
- Certificates carry both a certificate number and a separate verification code, so the public
  verification portal can't be brute-forced from certificate numbers alone.
- Course "delete" in the admin panel soft-disables the programme (`isActive = false`) rather than
  hard-deleting, since applications and student records reference it — this preserves historical
  data integrity.
