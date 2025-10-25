import { hashPassword } from "@/lib/auth/password";
import { canAccessAdmin } from "@/lib/auth/permissions";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { errorResponse, successResponse } from "@/lib/utils/api";
import { getPagination } from "@/lib/utils/pagination";
import { userCreateSchema } from "@/lib/utils/validators";
import { Role } from "@prisma/client";
import { NextRequest } from "next/server";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession();
    if (!canAccessAdmin(session.user.role)) {
      return errorResponse("Forbidden", 403);
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? undefined;
    const roleParam = searchParams.get("role") ?? undefined;
    const { skip, take, page, perPage } = getPagination(
      searchParams.get("page") ?? undefined,
      searchParams.get("perPage") ?? undefined
    );

    const where = {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } }
            ]
          }
        : {}),
      ...(roleParam ? { role: roleParam as Role } : {})
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.user.count({ where })
    ]);

    return successResponse({ users, meta: { total, page, perPage } });
  } catch (error) {
    if ((error as Error).message === "UNAUTHENTICATED") {
      return errorResponse("Unauthorized", 401);
    }
    console.error("GET /api/admin/users", error);
    return errorResponse("Failed to fetch users", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    if (!canAccessAdmin(session.user.role)) {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
    const payload = userCreateSchema.parse(body);
    const hashed = await hashPassword(payload.password);

    const user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        password: hashed,
        role: payload.role as Role
      }
    });

    return successResponse(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(error.errors.map((e) => e.message).join(", "), 422);
    }
    if ((error as Error).message === "UNAUTHENTICATED") {
      return errorResponse("Unauthorized", 401);
    }
    console.error("POST /api/admin/users", error);
    return errorResponse("Failed to create user", 500);
  }
}
