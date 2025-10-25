import SettingsForm from "@/components/admin/settings-form";

const SettingsPage = () => {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
      <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-text">Platform settings</h1>
        <p className="mt-2 text-sm text-text/70">
          Configure branding, email delivery, and notification preferences.
        </p>
        <div className="mt-6">
          <SettingsForm />
        </div>
      </section>
      <aside className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text">Environment</h2>
        <p className="mt-2 text-sm text-text/70">
          Remember to update your environment variables in Vercel when changing database credentials or authentication secrets.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-text/70">
          <li>• DATABASE_URL</li>
          <li>• NEXTAUTH_SECRET</li>
          <li>• NEXTAUTH_URL</li>
          <li>• WEBSOCKET_URL</li>
        </ul>
        <p className="mt-4 text-xs text-text/50">
          Changes made here are stored in the settings table and can be retrieved throughout the application via the Settings API.
        </p>
      </aside>
    </div>
  );
};

export default SettingsPage;
