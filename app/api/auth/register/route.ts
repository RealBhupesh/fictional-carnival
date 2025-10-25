import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";
import { errorResponse, successResponse } from "@/lib/utils/api";
import { registerSchema } from "@/lib/utils/validators";
import { NextRequest } from "next/server";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: payload.email } });
    if (existing) {
      return errorResponse("Email already in use", 409);
    }

    const password = await hashPassword(payload.password);
    const user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        password,
        role: "USER"
      }
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "user:registered",
        details: `User ${user.email} registered via client portal`
      }
    });

    return successResponse({
      id: user.id,
      name: user.name,
      email: user.email
    }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(error.errors.map((e) => e.message).join(", "), 422);
    }
    console.error("POST /api/auth/register", error);
    return errorResponse("Failed to register", 500);
  }
}
