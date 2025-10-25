import LoginForm from "@/components/client/login-form";
import { Button } from "@/components/shared/button";
import { authOptions } from "@/lib/auth/options";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-8 px-4 py-16 md:grid-cols-2">
      <section className="flex flex-col justify-center">
        <h1 className="text-3xl font-semibold text-text">Welcome back</h1>
        <p className="mt-3 text-sm text-text/70">
          Sign in to access your personalized dashboard and live notifications.
        </p>
        <div className="mt-6 rounded-3xl border border-border bg-surface p-6 shadow-sm">
          <LoginForm />
        </div>
        <p className="mt-4 text-sm text-text/70">
          New here? <Link href="/register" className="text-primary">Create an account</Link>.
        </p>
      </section>
      <aside className="rounded-3xl border border-border bg-surface p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-text">Why customers choose NovaPulse</h2>
        <ul className="mt-4 space-y-3 text-sm text-text/70">
          <li>• Real-time analytics synced across every device.</li>
          <li>• Secure authentication with granular permissions.</li>
          <li>• Admin and client experiences in a single platform.</li>
        </ul>
        <Button asChild className="mt-6 w-full" variant="outline">
          <Link href="/products">Explore platform features</Link>
        </Button>
      </aside>
    </div>
  );
}
