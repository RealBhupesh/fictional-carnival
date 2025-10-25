import { hashPassword } from "@/lib/auth/password";
import { canAccessAdmin, canManageUsers } from "@/lib/auth/permissions";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { errorResponse, successResponse } from "@/lib/utils/api";
import { userUpdateSchema } from "@/lib/utils/validators";
import { Role } from "@prisma/client";
import { NextRequest } from "next/server";
import { ZodError } from "zod";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const session = await requireSession();
    if (!canAccessAdmin(session.user.role)) {
      return errorResponse("Forbidden", 403);
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    return successResponse(user);
  } catch (error) {
    if ((error as Error).message === "UNAUTHENTICATED") {
      return errorResponse("Unauthorized", 401);
    }
    console.error("GET /api/admin/users/[id]", error);
    return errorResponse("Failed to fetch user", 500);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await requireSession();
    if (!canAccessAdmin(session.user.role)) {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
    const payload = userUpdateSchema.parse(body);

    const data: { [key: string]: unknown } = { ...payload };

    if (payload.password) {
      data.password = await hashPassword(payload.password);
    }

    if (payload.role) {
      data.role = payload.role as Role;
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return successResponse(user);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(error.errors.map((e) => e.message).join(", "), 422);
    }
    if ((error as Error).message === "UNAUTHENTICATED") {
      return errorResponse("Unauthorized", 401);
    }
    console.error("PATCH /api/admin/users/[id]", error);
    return errorResponse("Failed to update user", 500);
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const session = await requireSession();
    if (!canManageUsers(session.user.role)) {
      return errorResponse("Forbidden", 403);
    }

    await prisma.user.delete({ where: { id: params.id } });
    return successResponse({ deleted: true });
  } catch (error) {
    if ((error as Error).message === "UNAUTHENTICATED") {
      return errorResponse("Unauthorized", 401);
    }
    console.error("DELETE /api/admin/users/[id]", error);
    return errorResponse("Failed to delete user", 500);
  }
}
