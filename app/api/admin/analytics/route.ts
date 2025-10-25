import { canAccessAdmin } from "@/lib/auth/permissions";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { errorResponse, successResponse } from "@/lib/utils/api";

export async function GET() {
  try {
    const session = await requireSession();
    if (!canAccessAdmin(session.user.role)) {
      return errorResponse("Forbidden", 403);
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalUsers, recentUsers, publishedContent, activityCount, notifications] =
      await prisma.$transaction([
        prisma.user.count(),
        prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
        prisma.content.count({ where: { published: true } }),
        prisma.activityLog.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
        prisma.notification.count({ where: { createdAt: { gte: thirtyDaysAgo } } })
      ]);

    const activities = await prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });

    const logs = await prisma.activityLog.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" }
    });

    const dailyMap = logs.reduce<Record<string, number>>((acc, log) => {
      const key = log.createdAt.toISOString().slice(0, 10);
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    const dailyCounts = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));

    return successResponse({
      metrics: {
        totalUsers,
        recentUsers,
        publishedContent,
        activityCount,
        notifications
      },
      dailyCounts,
      activities
    });
  } catch (error) {
    if ((error as Error).message === "UNAUTHENTICATED") {
      return errorResponse("Unauthorized", 401);
    }
    console.error("GET /api/admin/analytics", error);
    return errorResponse("Failed to fetch analytics", 500);
  }
}
