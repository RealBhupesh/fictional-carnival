import { prisma } from "@/lib/db/prisma";
import { errorResponse, successResponse } from "@/lib/utils/api";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? undefined;

    const contents = await prisma.content.findMany({
      where: {
        published: true,
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { content: { contains: search, mode: "insensitive" } }
              ]
            }
          : {})
      },
      orderBy: { publishDate: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        image: true,
        publishDate: true
      }
    });

    return successResponse(contents);
  } catch (error) {
    console.error("GET /api/client/content", error);
    return errorResponse("Failed to fetch content", 500);
  }
}
