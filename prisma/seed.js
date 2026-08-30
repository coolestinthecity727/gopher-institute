// Seeds the database with realistic starter data.
// Run with: npm run db:seed  (after `npm run db:push`)

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { customAlphabet } = require("nanoid");

const prisma = new PrismaClient();
const genCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 10);

const COURSES = [
  { name: "Dispensary Assistant", category: "Health Sciences", duration: "12 months", fee: 450, intake: "January & July", description: "Trains learners to assist licensed pharmacists with dispensing, stock control and patient care in clinics, hospitals and pharmacies." },
  { name: "Nurse Aide", category: "Health Sciences", duration: "9 months", fee: 420, intake: "January & July", description: "Foundational patient-care skills including basic nursing procedures, hygiene, first aid and support for qualified nursing staff." },
  { name: "Welding & Fabrication", category: "Engineering Trades", duration: "12 months", fee: 500, intake: "January & July", description: "Hands-on arc, MIG and gas welding, metal fabrication and workshop safety for the construction and manufacturing sectors." },
  { name: "Plumbing", category: "Engineering Trades", duration: "9 months", fee: 400, intake: "January & July", description: "Pipe fitting, drainage systems, water supply installation and maintenance for residential and commercial buildings." },
  { name: "Electrical Installation", category: "Engineering Trades", duration: "12 months", fee: 480, intake: "January & July", description: "Domestic and light industrial wiring, circuit design, safety regulations and practical electrical maintenance." },
  { name: "Information & Communication Technology (ICT)", category: "Technology", duration: "9 months", fee: 400, intake: "January & July", description: "Computer literacy, networking basics, hardware maintenance and everyday office and productivity software." },
  { name: "Fashion & Design", category: "Creative Arts", duration: "9 months", fee: 380, intake: "January & July", description: "Garment construction, pattern making, textile selection and small-scale fashion business skills." },
  { name: "Hospitality & Catering", category: "Hospitality", duration: "9 months", fee: 390, intake: "January & July", description: "Food preparation, restaurant service, housekeeping and front-of-house skills for the hospitality industry." },
  { name: "Business Management", category: "Business", duration: "12 months", fee: 420, intake: "January & July", description: "Entrepreneurship, bookkeeping, marketing and operations skills for running or working in a small business." },
  { name: "Early Childhood Development (ECD)", category: "Education", duration: "12 months", fee: 400, intake: "January & July", description: "Child development theory and practical classroom skills for teaching and caring for young learners." },
  { name: "Till Operation & Merchandising", category: "Business", duration: "6 months", fee: 300, intake: "January, April, July & October", description: "Point-of-sale systems, cash handling, stock merchandising and customer service for retail environments." },
  { name: "Beauty Therapy", category: "Creative Arts", duration: "9 months", fee: 380, intake: "January & July", description: "Skincare, manicure/pedicure, makeup application and salon hygiene and client-care standards." },
  { name: "Hairdressing", category: "Creative Arts", duration: "9 months", fee: 370, intake: "January & July", description: "Hair cutting, styling, treatments and salon management for a career in the hair industry." },
  { name: "Building & Construction", category: "Engineering Trades", duration: "12 months", fee: 480, intake: "January & July", description: "Bricklaying, concrete work, reading building plans and general construction site practice." },
  { name: "Tiling", category: "Engineering Trades", duration: "6 months", fee: 320, intake: "January, April, July & October", description: "Floor and wall tiling techniques, surface preparation and finishing for residential and commercial jobs." },
];

const PARTNERS = [
  { name: "Ministry of Vocational Training and Youth Empowerment", description: "Our founding government partner, providing curriculum accreditation, oversight and national vocational qualification pathways.", isMinistry: true, website: "https://www.gov.zw" },
  { name: "Zimbabwe National Chamber of Commerce", description: "Supports graduate placement and small-business mentorship for our Business Management and entrepreneurship learners.", website: "https://www.zncc.co.zw" },
  { name: "Bulawayo City Health Department", description: "Clinical placement partner for Dispensary Assistant and Nurse Aide learners.", website: "" },
  { name: "Zimbabwe Building Contractors Association", description: "Apprenticeship and job placement partner for Building, Tiling, Plumbing and Electrical graduates.", website: "" },
];

const POSTS = [
  { title: "2026 Second Intake Now Open", category: "NEWS", summary: "Applications for the July 2026 intake are open across all 15 vocational programmes.", content: "Gopher Institute Foundation is pleased to announce that applications for the July 2026 intake are now open. Prospective students can apply online through the Apply Now portal. Limited spaces are available in high-demand programmes including Nurse Aide, Electrical Installation and ICT.", location: "Gopher Institute Foundation, Pelandaba, Bulawayo" },
  { title: "Ministry Delegation Visits Gopher Institute", category: "NEWS", summary: "Officials from the Ministry of Vocational Training and Youth Empowerment toured our workshops and clinical training labs.", content: "A delegation from the Ministry of Vocational Training and Youth Empowerment visited our campus to review training standards and meet graduating students. The visit reaffirmed our partnership and accreditation status for all 15 programmes offered." },
  { title: "Annual Graduation & Skills Expo", category: "EVENT", summary: "Join us as we celebrate our 2025 graduating class and showcase learner projects to prospective employers.", content: "Our Annual Graduation and Skills Expo brings together graduates, employers and the community to celebrate achievement and connect skilled young people with job opportunities. The event includes a skills showcase from Welding, Fashion & Design, Beauty Therapy and ICT learners.", location: "Gopher Institute Foundation Main Hall", eventDateOffsetDays: 30 },
  { title: "Free Career Guidance Open Day", category: "EVENT", summary: "A free session for prospective students and parents to learn about our programmes, fees and application process.", content: "Bring your questions! Our Career Guidance Open Day gives prospective students and their families a chance to tour the campus, meet instructors and get help completing their online application on the spot.", location: "Gopher Institute Foundation, Pelandaba, Bulawayo", eventDateOffsetDays: 14 },
];

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("Seeding Gopher Institute Foundation database...");

  // Admin user
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@gopherinstitute.ac.zw";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      role: "SUPER_ADMIN",
      fullName: "Institute Administrator",
    },
  });
  console.log(`Super admin ready -> ${adminEmail} / ${adminPassword}`);

  // Courses
  const courseRecords = [];
  for (const c of COURSES) {
    const course = await prisma.course.upsert({
      where: { id: slugify(c.name) },
      update: {},
      create: { id: slugify(c.name), ...c },
    });
    courseRecords.push(course);
  }
  console.log(`Seeded ${courseRecords.length} courses`);

  // Partners
  for (const p of PARTNERS) {
    const existing = await prisma.partner.findFirst({ where: { name: p.name } });
    if (!existing) await prisma.partner.create({ data: p });
  }
  console.log(`Seeded ${PARTNERS.length} partners`);

  // News & Events
  for (const post of POSTS) {
    const slug = slugify(post.title);
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (existing) continue;
    const eventDate = post.eventDateOffsetDays
      ? new Date(Date.now() + post.eventDateOffsetDays * 86400000)
      : null;
    await prisma.post.create({
      data: {
        title: post.title,
        slug,
        category: post.category,
        summary: post.summary,
        content: post.content,
        location: post.location || null,
        eventDate,
      },
    });
  }
  console.log(`Seeded ${POSTS.length} news/event posts`);

  // A sample enrolled student + issued certificate, for demoing the
  // registration-check and certificate-verification portals.
  const sampleCourse = courseRecords[0];
  const sampleStudentEmail = "sample.student@gopherinstitute.ac.zw";
  let sampleUser = await prisma.user.findUnique({ where: { email: sampleStudentEmail } });
  if (!sampleUser) {
    sampleUser = await prisma.user.create({
      data: {
        email: sampleStudentEmail,
        passwordHash: await bcrypt.hash("Student123!", 10),
        role: "STUDENT",
        fullName: "Tatenda Moyo",
      },
    });
  }

  let sampleStudent = await prisma.student.findFirst({ where: { studentNumber: "GIF-2024-0001" } });
  if (!sampleStudent) {
    sampleStudent = await prisma.student.create({
      data: {
        studentNumber: "GIF-2024-0001",
        userId: sampleUser.id,
        fullName: "Tatenda Moyo",
        email: sampleStudentEmail,
        phone: "0771234567",
        courseId: sampleCourse.id,
        status: "ALUMNI",
        enrollmentDate: new Date("2024-01-15"),
        graduationDate: new Date("2024-12-06"),
      },
    });
  }

  const existingCert = await prisma.certificate.findFirst({ where: { studentId: sampleStudent.id } });
  if (!existingCert) {
    await prisma.certificate.create({
      data: {
        certificateNo: "GIF-CERT-2024-0001",
        verificationCode: genCode(),
        studentId: sampleStudent.id,
        courseName: sampleCourse.name,
        grade: "Distinction",
        issueDate: new Date("2024-12-10"),
      },
    });
  }
  console.log("Seeded a sample alumnus with an issued certificate (login: sample.student@gopherinstitute.ac.zw / Student123!)");

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
