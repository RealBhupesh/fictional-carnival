import { prisma } from "@/lib/db/prisma";
import { errorResponse, successResponse } from "@/lib/utils/api";

interface Params {
  params: {
    slug: string;
  };
}

export async function GET(_: Request, { params }: Params) {
  try {
    const content = await prisma.content.findFirst({
      where: { slug: params.slug, published: true },
      include: {
        author: {
          select: { id: true, name: true }
        }
      }
    });

    if (!content) {
      return errorResponse("Content not found", 404);
    }

    return successResponse(content);
  } catch (error) {
    console.error("GET /api/client/content/[slug]", error);
    return errorResponse("Failed to fetch content", 500);
  }
}
