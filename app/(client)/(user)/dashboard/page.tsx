import NotificationsFeed from "@/components/client/notifications-feed";
import { Button } from "@/components/shared/button";
import { prisma } from "@/lib/db/prisma";
import { authOptions } from "@/lib/auth/options";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function UserDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const [notifications, recommendedContent] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5
    }),
    prisma.content.findMany({
      where: { published: true },
      orderBy: { publishDate: "desc" },
      take: 4,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        publishDate: true
      }
    })
  ]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      <header className="rounded-3xl border border-border bg-surface p-8 shadow-sm">
        <p className="text-sm text-text/60">Welcome back</p>
        <h1 className="mt-2 text-3xl font-semibold text-text">{session.user.name ?? "Your dashboard"}</h1>
        <p className="mt-2 text-sm text-text/70">
          Track updates from your teams, review recommended content, and stay aligned with admin announcements.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild variant="primary">
            <Link href="/profile">Update profile</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/products">Explore features</Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-text">Recommended for you</h2>
          <p className="mt-2 text-sm text-text/70">
            Personalized articles powered by your interaction history.
          </p>
          <div className="mt-4 space-y-4">
            {recommendedContent.map((content) => (
              <Link
                key={content.id}
                href={`/content/${content.slug}`}
                className="block rounded-2xl border border-border/80 bg-background p-4 transition hover:-translate-y-1 hover:border-primary/60"
              >
                <p className="text-xs text-primary">
                  {content.publishDate ? new Date(content.publishDate).toLocaleDateString() : "Draft"}
                </p>
                <h3 className="mt-1 text-base font-semibold text-text">{content.title}</h3>
                <p className="mt-2 text-sm text-text/70">{content.excerpt ?? "Explore the full story."}</p>
              </Link>
            ))}
            {recommendedContent.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-text/60">
                New content published by admins will appear here instantly.
              </p>
            ) : null}
          </div>
        </section>
        <NotificationsFeed
          initialNotifications={notifications.map((notification) => ({
            ...notification,
            createdAt: notification.createdAt
          }))}
        />
      </div>
    </div>
  );
}
