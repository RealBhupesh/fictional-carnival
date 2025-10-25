import ProfileForm from "@/components/client/profile-form";
import { Button } from "@/components/shared/button";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      role: true
    }
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-[1.5fr,1fr]">
      <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-text">Profile</h1>
        <p className="mt-2 text-sm text-text/70">Update your personal details and manage your workspace security.</p>
        <ProfileForm
          className="mt-6"
          defaultValues={{
            name: user.name,
            email: user.email,
            image: user.image
          }}
        />
      </section>
      <aside className="space-y-6">
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-text">Account details</h2>
          <dl className="mt-4 space-y-4 text-sm text-text/70">
            <div className="flex items-start justify-between">
              <dt className="font-medium text-text">Role</dt>
              <dd className="rounded-full bg-primary/10 px-3 py-1 text-xs uppercase tracking-wide text-primary">
                {user.role}
              </dd>
            </div>
            <div className="flex items-start justify-between">
              <dt className="font-medium text-text">Member since</dt>
              <dd>{user.createdAt.toLocaleDateString()}</dd>
            </div>
            <div className="flex items-start justify-between">
              <dt className="font-medium text-text">Workspace</dt>
              <dd>NovaPulse Cloud</dd>
            </div>
          </dl>
        </div>
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-text">Need more control?</h2>
          <p className="mt-2 text-sm text-text/70">
            Visit the admin console to manage users, approvals, and platform-wide settings if you have the right permissions.
          </p>
          <Button asChild className="mt-4 w-full" variant="outline">
            <Link href="/admin/dashboard">Go to admin console</Link>
          </Button>
        </div>
      </aside>
    </div>
  );
}
