import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateApplicationNo } from "@/lib/ids";
import { getSessionFromCookies, isStaff } from "@/lib/auth";
import { sendEmail, applicationReceivedEmail } from "@/lib/email";

const applicationSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  nationalId: z.string().min(3),
  dateOfBirth: z.string().min(4),
  gender: z.string().min(1),
  address: z.string().min(3),
  guardianName: z.string().optional().default(""),
  guardianPhone: z.string().optional().default(""),
  highestQualification: z.string().min(1),
  courseId: z.string().min(1),
  idDocumentUrl: z.string().optional().default(""),
  transcriptUrl: z.string().optional().default(""),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = applicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Please check that all required fields are filled in correctly." }, { status: 400 });
    }
    const data = parsed.data;

    const course = await prisma.course.findUnique({ where: { id: data.courseId } });
    if (!course) return NextResponse.json({ error: "Selected programme was not found." }, { status: 400 });

    const applicationNo = generateApplicationNo();

    const application = await prisma.application.create({
      data: {
        applicationNo,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        nationalId: data.nationalId,
        dateOfBirth: new Date(data.dateOfBirth),
        gender: data.gender,
        address: data.address,
        guardianName: data.guardianName || null,
        guardianPhone: data.guardianPhone || null,
        highestQualification: data.highestQualification,
        courseId: data.courseId,
        idDocumentUrl: data.idDocumentUrl || null,
        transcriptUrl: data.transcriptUrl || null,
      },
    });

    await sendEmail({
      to: application.email,
      subject: `Application Received — ${application.applicationNo}`,
      html: applicationReceivedEmail({
        fullName: application.fullName,
        applicationNo: application.applicationNo,
        courseName: course.name,
      }),
    });

    return NextResponse.json({ applicationNo: application.applicationNo }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Unable to submit application. Please try again." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = getSessionFromCookies();
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const q = searchParams.get("q");

  const applications = await prisma.application.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
      ...(q
        ? {
            OR: [
              { fullName: { contains: q } },
              { applicationNo: { contains: q } },
              { email: { contains: q } },
            ],
          }
        : {}),
    },
    include: { course: true },
    orderBy: { submittedAt: "desc" },
  });

  return NextResponse.json({ applications });
}