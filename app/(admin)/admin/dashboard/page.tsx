import ActivityFeed from "@/components/admin/activity-feed";
import AnalyticsAreaChart from "@/components/admin/analytics-area-chart";
import MetricCard from "@/components/admin/metric-card";
import { prisma } from "@/lib/db/prisma";
import { TrendingUp, Users, Bell, FileText } from "lucide-react";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export default async function AdminDashboardPage() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [totalUsers, managerCount, contentCount, notifications, activities, logs] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: { in: ["ADMIN", "MANAGER"] } } }),
    prisma.content.count(),
    prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { id: true, name: true } }
      }
    }),
    prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } }
      }
    }),
    prisma.activityLog.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" }
    })
  ]);

  const monthlyRevenue = totalUsers * 49;

  const dailyMap = logs.reduce<Record<string, number>>((acc, log) => {
    const key = log.createdAt.toISOString().slice(0, 10);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const dailyCounts = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-semibold text-text">Operations overview</h1>
        <p className="mt-2 text-sm text-text/70">
          Monitor user growth, publishing cadence, and engagement in real-time.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Active users" value={totalUsers} change="All authenticated accounts" icon={Users} accent="primary" />
        <MetricCard
          title="Revenue potential"
          value={formatCurrency(monthlyRevenue)}
          change="Projected MRR based on active seats"
          icon={TrendingUp}
          accent="secondary"
        />
        <MetricCard
          title="Published content"
          value={contentCount}
          change="Articles available to client experiences"
          icon={FileText}
          accent="accent"
        />
        <MetricCard
          title="Unseen notifications"
          value={notifications.length}
          change="Recent alerts pushed to admins"
          icon={Bell}
          accent="primary"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text">Engagement trend</h2>
              <p className="text-sm text-text/70">Activity captured over the last 30 days.</p>
            </div>
          </div>
          <div className="mt-6">
            <AnalyticsAreaChart data={dailyCounts} />
          </div>
        </div>
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-text">Live notifications</h2>
          <p className="mt-2 text-sm text-text/70">Latest updates pushed through Socket.io.</p>
          <div className="mt-4 space-y-3">
            {notifications.map((notification) => (
              <article key={notification.id} className="rounded-2xl border border-border/80 bg-background p-4">
                <p className="text-sm font-medium text-text">{notification.title}</p>
                <p className="mt-1 text-sm text-text/70">{notification.message}</p>
                <p className="mt-2 text-xs text-text/50">{notification.createdAt.toLocaleString()}</p>
              </article>
            ))}
            {notifications.length === 0 ? (
              <p className="text-sm text-text/60">No notifications have been sent yet.</p>
            ) : null}
          </div>
        </div>
      </section>

      <ActivityFeed items={activities} />
    </div>
  );
}
