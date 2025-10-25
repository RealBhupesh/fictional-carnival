import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";
import { errorResponse, successResponse } from "@/lib/utils/api";
import { profileUpdateSchema } from "@/lib/utils/validators";
import { authOptions } from "@/lib/auth/options";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { ZodError } from "zod";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return errorResponse("Unauthorized", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true
    }
  });

  if (!user) {
    return errorResponse("User not found", 404);
  }

  return successResponse(user);
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const payload = profileUpdateSchema.parse(body);

    const data: Record<string, unknown> = {};
    if (payload.name) data.name = payload.name;
    if (payload.image) data.image = payload.image;
    if (payload.password) data.password = await hashPassword(payload.password);

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true
      }
    });

    return successResponse(user);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(error.errors.map((e) => e.message).join(", "), 422);
    }
    console.error("PATCH /api/client/profile", error);
    return errorResponse("Failed to update profile", 500);
  }
}
