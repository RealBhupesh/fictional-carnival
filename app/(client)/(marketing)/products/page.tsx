import { Button } from "@/components/shared/button";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";

const tiers = [
  {
    name: "Launch",
    price: "$49",
    description: "For startups validating new products.",
    features: ["Up to 3 team members", "Standard analytics", "Email support"],
    cta: "Start launch"
  },
  {
    name: "Scale",
    price: "$149",
    description: "For growing teams with dedicated workflows.",
    features: ["Unlimited team members", "Real-time dashboards", "Priority support"],
    cta: "Scale today",
    highlighted: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For global organizations with stringent requirements.",
    features: ["SOC2 compliance", "Dedicated CSM", "Custom integrations"],
    cta: "Contact sales"
  }
];

export default async function ProductsPage() {
  const categories = await prisma.content.findMany({
    where: { published: true },
    select: { id: true, title: true, slug: true, excerpt: true },
    orderBy: { title: "asc" }
  });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-16">
      <section className="text-center">
        <h1 className="text-3xl font-semibold text-text">Product overview</h1>
        <p className="mt-4 text-base text-text/70">
          Modular building blocks power your admin workflows and customer experience. Choose the tier that matches your roadmap.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`flex flex-col gap-4 rounded-3xl border border-border bg-surface p-6 text-left shadow-sm ${
              tier.highlighted ? "ring-2 ring-primary" : ""
            }`}
          >
            <div>
              <h2 className="text-xl font-semibold text-text">{tier.name}</h2>
              <p className="text-sm text-text/60">{tier.description}</p>
              <p className="mt-4 text-3xl font-bold text-text">{tier.price}</p>
            </div>
            <ul className="flex flex-1 flex-col gap-2 text-sm text-text/70">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-secondary" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button asChild variant={tier.highlighted ? "primary" : "outline"}>
              <Link href={tier.name === "Enterprise" ? "/contact" : "/register"}>{tier.cta}</Link>
            </Button>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-border bg-surface p-8">
        <h2 className="text-2xl font-semibold text-text">Content categories</h2>
        <p className="mt-2 text-sm text-text/70">Articles managed in the admin console surface here instantly.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/content/${category.slug}`}
              className="rounded-2xl border border-border bg-background p-5 text-sm text-text/80 transition hover:-translate-y-1 hover:border-primary/50 hover:text-primary"
            >
              <h3 className="text-lg font-semibold text-text">{category.title}</h3>
              <p className="mt-2 text-sm text-text/60">{category.excerpt ?? "Explore this insight."}</p>
            </Link>
          ))}
          {categories.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-text/60">
              Publish content in the admin panel to highlight categories for customers.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
