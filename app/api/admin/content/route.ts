import { canAccessAdmin } from "@/lib/auth/permissions";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { errorResponse, successResponse } from "@/lib/utils/api";
import { getPagination } from "@/lib/utils/pagination";
import { contentSchema } from "@/lib/utils/validators";
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
    const status = searchParams.get("status") ?? undefined;
    const { skip, take, page, perPage } = getPagination(
      searchParams.get("page") ?? undefined,
      searchParams.get("perPage") ?? undefined
    );

    const where = {
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { content: { contains: search, mode: "insensitive" } }
            ]
          }
        : {}),
      ...(status === "published" ? { published: true } : {}),
      ...(status === "draft" ? { published: false } : {})
    };

    const [contents, total] = await Promise.all([
      prisma.content.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        include: {
          author: {
            select: { id: true, name: true, email: true }
          }
        }
      }),
      prisma.content.count({ where })
    ]);

    return successResponse({ contents, meta: { total, page, perPage } });
  } catch (error) {
    if ((error as Error).message === "UNAUTHENTICATED") {
      return errorResponse("Unauthorized", 401);
    }
    console.error("GET /api/admin/content", error);
    return errorResponse("Failed to fetch content", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    if (!canAccessAdmin(session.user.role)) {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
    const payload = contentSchema.parse(body);

    const content = await prisma.content.create({
      data: {
        title: payload.title,
        slug: payload.slug,
        content: payload.content,
        excerpt: payload.excerpt,
        image: payload.image,
        published: payload.published ?? false,
        publishDate: payload.publishDate ?? null,
        authorId: session.user.id
      },
      include: {
        author: {
          select: { id: true, name: true }
        }
      }
    });

    return successResponse(content, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(error.errors.map((e) => e.message).join(", "), 422);
    }
    if ((error as Error).message === "UNAUTHENTICATED") {
      return errorResponse("Unauthorized", 401);
    }
    console.error("POST /api/admin/content", error);
    return errorResponse("Failed to create content", 500);
  }
}
