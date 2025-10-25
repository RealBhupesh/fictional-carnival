import { Button } from "@/components/shared/button";
import Logo from "@/components/shared/logo";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";

const features = [
  {
    title: "Real-time insights",
    description: "Monitor platform health, user engagement, and revenue in a single view."
  },
  {
    title: "Powerful content engine",
    description: "Create, schedule, and optimize content with collaborative workflows."
  },
  {
    title: "Secure user management",
    description: "Granular permissions and audit trails keep your organization compliant."
  }
];

const testimonials = [
  {
    quote: "NovaPulse gives our team confidence in every launch.",
    name: "Jamie Curtis",
    role: "Chief Product Officer, Stellar Labs"
  },
  {
    quote: "Analytics and collaboration are finally in the same place.",
    name: "Priya Singh",
    role: "Head of Operations, FluxData"
  }
];

export default async function MarketingHome() {
  const featuredContent = await prisma.content.findMany({
    where: { published: true },
    orderBy: { publishDate: "desc" },
    take: 3,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      publishDate: true
    }
  });

  return (
    <div className="bg-background">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-24 text-center">
          <div className="mx-auto w-fit rounded-full border border-border/60 bg-surface px-4 py-1 text-sm text-primary shadow">
            Production-ready starter kit
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-text sm:text-5xl md:text-6xl">
            Build real-time experiences with confidence
          </h1>
          <p className="mx-auto max-w-2xl text-base text-text/70 sm:text-lg">
            NovaPulse combines analytics, content management, and live collaboration tools into a single platform.
            Deploy to Vercel, connect PostgreSQL, and go-live in record time.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">Start now</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/products">Explore features</Link>
            </Button>
          </div>
          <div className="mx-auto flex flex-wrap items-center justify-center gap-6 text-sm text-text/60">
            <span>Next.js 15</span>
            <span>Prisma ORM</span>
            <span>NextAuth.js</span>
            <span>Socket.io</span>
            <span>PostgreSQL</span>
          </div>
        </div>
      </section>

      <section className="border-t border-border/80 bg-surface py-16">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 md:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-border bg-background p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-text">{feature.title}</h3>
              <p className="mt-3 text-sm text-text/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-text">Latest insights</h2>
              <p className="text-sm text-text/70">Content published by your team appears instantly for all visitors.</p>
            </div>
            <Button asChild variant="ghost">
              <Link href="/products">View all</Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {featuredContent.map((content) => (
              <Link
                key={content.id}
                href={`/content/${content.slug}`}
                className="group rounded-2xl border border-border bg-surface p-6 transition hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg"
              >
                <p className="text-xs uppercase tracking-wide text-primary">{content.publishDate?.toLocaleDateString()}</p>
                <h3 className="mt-3 text-lg font-semibold text-text group-hover:text-primary">{content.title}</h3>
                <p className="mt-2 text-sm text-text/70">{content.excerpt ?? "Stay tuned for more details."}</p>
              </Link>
            ))}
            {featuredContent.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-surface p-6 text-sm text-text/60">
                No content published yet. Draft content in the admin panel will appear here when published.
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="border-t border-border/80 bg-surface py-16">
        <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 text-center">
          <h2 className="text-2xl font-semibold text-text">Teams ship faster on NovaPulse</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {testimonials.map((testimonial) => (
              <figure key={testimonial.name} className="rounded-2xl border border-border bg-background p-6 text-left shadow-sm">
                <blockquote className="text-sm italic text-text/80">“{testimonial.quote}”</blockquote>
                <figcaption className="mt-4 text-sm font-medium text-text">
                  {testimonial.name}
                  <span className="block text-xs text-text/60">{testimonial.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 rounded-3xl border border-border bg-surface px-6 py-12 text-center">
          <Logo className="text-xl" />
          <h2 className="text-2xl font-semibold text-text">Ready for real-time engagement?</h2>
          <p className="max-w-xl text-sm text-text/70">
            Configure your database, set environment variables, and deploy to Vercel with a single command. NovaPulse ships with
            authentication, analytics, and content tooling baked in.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="md">
              <Link href="/register">Create your workspace</Link>
            </Button>
            <Button asChild size="md" variant="outline">
              <Link href="/contact">Talk to sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
