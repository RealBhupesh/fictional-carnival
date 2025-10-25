import RegisterForm from "@/components/client/register-form";
import { Button } from "@/components/shared/button";
import { authOptions } from "@/lib/auth/options";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-8 px-4 py-16 md:grid-cols-2">
      <section className="flex flex-col justify-center">
        <h1 className="text-3xl font-semibold text-text">Create your account</h1>
        <p className="mt-3 text-sm text-text/70">
          Join NovaPulse to unlock real-time collaboration, analytics, and content workflows in minutes.
        </p>
        <div className="mt-6 rounded-3xl border border-border bg-surface p-6 shadow-sm">
          <RegisterForm />
        </div>
        <p className="mt-4 text-sm text-text/70">
          Already have an account? <Link href="/login" className="text-primary">Sign in</Link>.
        </p>
      </section>
      <aside className="rounded-3xl border border-border bg-surface p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-text">What’s included</h2>
        <ul className="mt-4 space-y-3 text-sm text-text/70">
          <li>• Guided onboarding and workspace templates.</li>
          <li>• Live dashboards powered by Socket.io.</li>
          <li>• Secure authentication backed by NextAuth.js.</li>
        </ul>
        <Button asChild className="mt-6 w-full" variant="outline">
          <Link href="/about">Meet the team</Link>
        </Button>
      </aside>
    </div>
  );
}
