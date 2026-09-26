import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signSession, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, phone, password, courseId } = await req.json();

    if (!fullName || !email || !password || !courseId) {
      return NextResponse.json(
        { error: "Full name, email, password and course are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(fullName).trim();
    const cleanPhone = phone ? String(phone).trim() : "";

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found." },
        { status: 404 }
      );
    }

    if (!course.isOnline) {
      return NextResponse.json(
        { error: "This course is not available for online enrollment." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please log in instead." },
        { status: 409 }
      );
    }

    const studentNumber = `GIF-ONL-${Date.now().toString().slice(-8)}`;

    const passwordHash = await hashPassword(password);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: cleanEmail,
          passwordHash,
          role: "STUDENT",
          fullName: cleanName,
          phone: cleanPhone || null,
        },
      });

      const student = await tx.student.create({
        data: {
          studentNumber,
          userId: user.id,
          fullName: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          courseId,
          learningMode: "ONLINE",
        },
      });

      const enrollment = await tx.courseEnrollment.create({
        data: {
          studentId: student.id,
          courseId,
        },
      });

      return { user, student, enrollment };
    });

    const token = signSession({
      userId: result.user.id,
      role: "STUDENT",
      email: result.user.email,
      fullName: result.user.fullName,
    });

    const response = NextResponse.json(
      {
        ok: true,
        studentNumber: result.student.studentNumber,
        courseId,
      },
      { status: 201 }
    );

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Online registration error:", error);

    return NextResponse.json(
      { error: "Unable to create your online student account." },
      { status: 500 }
    );
  }
}
