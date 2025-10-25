import { prisma } from "@/lib/db/prisma";

const teamMembers = [
  {
    name: "Avery Rhodes",
    role: "Chief Executive Officer",
    bio: "Drives product vision and strategic partnerships for NovaPulse.",
    image: "/client/team-avery.jpg"
  },
  {
    name: "Morgan Lee",
    role: "Chief Technology Officer",
    bio: "Leads engineering initiatives focused on real-time collaboration.",
    image: "/client/team-morgan.jpg"
  },
  {
    name: "Zara Chen",
    role: "Head of Product",
    bio: "Shapes customer-centric experiences across admin and client surfaces.",
    image: "/client/team-zara.jpg"
  }
];

export default async function AboutPage() {
  const activity = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      user: { select: { name: true, role: true } }
    }
  });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-16 px-4 py-16">
      <section className="flex flex-col gap-6 text-center">
        <h1 className="text-3xl font-semibold text-text">Our mission</h1>
        <p className="mx-auto max-w-2xl text-base text-text/70">
          NovaPulse empowers organizations to orchestrate content, analytics, and customer engagement from a single command center.
          We believe high-performing teams deserve reliable infrastructure that adapts to change in real-time.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-text">Leadership</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {teamMembers.map((member) => (
            <div key={member.name} className="rounded-2xl border border-border bg-surface p-6 text-center">
              <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-primary/40 to-secondary/40" aria-hidden />
              <h3 className="mt-4 text-lg font-semibold text-text">{member.name}</h3>
              <p className="text-sm text-primary">{member.role}</p>
              <p className="mt-2 text-sm text-text/70">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-surface p-8">
        <h2 className="text-2xl font-semibold text-text">Continuous innovation</h2>
        <p className="mt-3 text-sm text-text/70">
          Our platform evolves with your organization. From secure authentication to live dashboards, NovaPulse accelerates every
          phase of your product lifecycle.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {activity.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border/80 bg-background p-4">
              <p className="text-sm font-semibold text-text">
                {item.user?.name ?? "System"}
                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                  {item.user?.role ?? "SYSTEM"}
                </span>
              </p>
              <p className="mt-2 text-xs uppercase tracking-wide text-text/50">{item.action}</p>
              <p className="mt-1 text-sm text-text/70">
                {item.details?.slice(0, 120) ?? "Activity logged"}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
