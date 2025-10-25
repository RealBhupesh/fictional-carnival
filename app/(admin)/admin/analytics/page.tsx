import AnalyticsAreaChart from "@/components/admin/analytics-area-chart";
import MetricCard from "@/components/admin/metric-card";
import { prisma } from "@/lib/db/prisma";
import { Activity, Gauge, UsersRound, BellRing } from "lucide-react";

const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value);

export default async function AnalyticsPage() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [newUsers, notifications, activities, rolesBreakdown, logs] = await Promise.all([
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.notification.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.activityLog.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.user.groupBy({
      by: ["role"],
      _count: { _all: true }
    }),
    prisma.activityLog.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" }
    })
  ]);

  const dailyMap = logs.reduce<Record<string, number>>((acc, log) => {
    const key = log.createdAt.toISOString().slice(0, 10);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));

  const totalUsers = rolesBreakdown.reduce((sum, role) => sum + role._count._all, 0);

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-semibold text-text">Analytics</h1>
        <p className="mt-2 text-sm text-text/70">
          Slice user engagement metrics and monitor platform activity over the last 30 days.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="New users (7d)"
          value={formatNumber(newUsers)}
          change="Accounts created in the last 7 days"
          icon={UsersRound}
          accent="secondary"
        />
        <MetricCard
          title="Notifications delivered"
          value={formatNumber(notifications)}
          change="Alerts sent via real-time channels"
          icon={BellRing}
          accent="accent"
        />
        <MetricCard
          title="Logged activities"
          value={formatNumber(activities)}
          change="Auditable events captured"
          icon={Activity}
          accent="primary"
        />
        <MetricCard
          title="Avg. events / day"
          value={chartData.length ? formatNumber(Math.round(activities / chartData.length)) : 0}
          change="Based on the last 30 days"
          icon={Gauge}
          accent="secondary"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-text">Activity over time</h2>
          <p className="mt-1 text-sm text-text/70">Track overall engagement captured from the audit log.</p>
          <div className="mt-6">
            <AnalyticsAreaChart data={chartData} />
          </div>
        </div>
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-text">Role distribution</h2>
          <p className="mt-1 text-sm text-text/70">Breakdown of all active accounts by role.</p>
          <div className="mt-4 space-y-3">
            {rolesBreakdown.map((role) => (
              <div key={role.role} className="flex items-center justify-between rounded-2xl border border-border/80 bg-background px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-text">{role.role}</p>
                  <p className="text-xs text-text/60">{((role._count._all / totalUsers) * 100).toFixed(1)}% of users</p>
                </div>
                <span className="text-lg font-semibold text-text">{role._count._all}</span>
              </div>
            ))}
            {rolesBreakdown.length === 0 ? <p className="text-sm text-text/60">No users yet.</p> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
