import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";

type ContentPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ContentPage({ params }: ContentPageProps) {
  const { slug } = await params;

  const article = await prisma.content.findFirst({
    where: { slug, published: true },
    include: {
      author: { select: { name: true } }
    }
  });

  if (!article) {
    notFound();
  }

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-16">
      <header>
        <p className="text-sm uppercase tracking-wide text-primary">{article.publishDate?.toLocaleDateString()}</p>
        <h1 className="mt-2 text-3xl font-semibold text-text">{article.title}</h1>
        <p className="mt-2 text-sm text-text/70">By {article.author?.name ?? "NovaPulse"}</p>
      </header>
      <div className="prose prose-slate max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: article.content }} />
    </article>
  );
}
