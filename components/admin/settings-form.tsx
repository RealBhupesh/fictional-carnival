"use client";

import { Button } from "@/components/shared/button";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface SettingsState {
  siteName: string;
  logoUrl: string;
  primaryColor: string;
  emailFrom: string;
  notificationsEnabled: boolean;
}

const defaultState: SettingsState = {
  siteName: "NovaPulse",
  logoUrl: "",
  primaryColor: "#3b82f6",
  emailFrom: "no-reply@novapulse.io",
  notificationsEnabled: true
};

const SettingsForm = () => {
  const [values, setValues] = useState<SettingsState>(defaultState);
  const [loading, setLoading] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/settings");
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error ?? "Unable to load settings");
      }
      setValues((prev) => ({
        ...prev,
        siteName: json.data?.["site.name"] ?? prev.siteName,
        logoUrl: json.data?.["site.logo"] ?? prev.logoUrl,
        primaryColor: json.data?.["theme.primary"] ?? prev.primaryColor,
        emailFrom: json.data?.["email.from"] ?? prev.emailFrom,
        notificationsEnabled: json.data?.["notifications.enabled"] ?? prev.notificationsEnabled
      }));
    } catch (error) {
      toast.error((error as Error).message ?? "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const persistSetting = async (key: string, value: unknown) => {
    const response = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value })
    });
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json?.error ?? "Failed to update setting");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setLoading(true);
      await Promise.all([
        persistSetting("site.name", values.siteName),
        persistSetting("site.logo", values.logoUrl),
        persistSetting("theme.primary", values.primaryColor),
        persistSetting("email.from", values.emailFrom),
        persistSetting("notifications.enabled", values.notificationsEnabled)
      ]);
      toast.success("Settings updated");
    } catch (error) {
      toast.error((error as Error).message ?? "Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <label className="text-sm font-medium text-text" htmlFor="siteName">
          Site name
        </label>
        <input
          id="siteName"
          value={values.siteName}
          onChange={(event) => setValues((prev) => ({ ...prev, siteName: event.target.value }))}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-text" htmlFor="logoUrl">
          Logo URL
        </label>
        <input
          id="logoUrl"
          value={values.logoUrl}
          onChange={(event) => setValues((prev) => ({ ...prev, logoUrl: event.target.value }))}
          placeholder="https://..."
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-text" htmlFor="primaryColor">
          Primary color
        </label>
        <input
          id="primaryColor"
          type="color"
          value={values.primaryColor}
          onChange={(event) => setValues((prev) => ({ ...prev, primaryColor: event.target.value }))}
          className="mt-1 h-10 w-24 cursor-pointer rounded-md border border-border bg-background"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-text" htmlFor="emailFrom">
          Email from address
        </label>
        <input
          id="emailFrom"
          type="email"
          value={values.emailFrom}
          onChange={(event) => setValues((prev) => ({ ...prev, emailFrom: event.target.value }))}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-background px-4 py-3">
        <div>
          <p className="text-sm font-medium text-text">Digest notifications</p>
          <p className="text-xs text-text/60">Send daily email summaries to administrators.</p>
        </div>
        <input
          type="checkbox"
          checked={values.notificationsEnabled}
          onChange={(event) => setValues((prev) => ({ ...prev, notificationsEnabled: event.target.checked }))}
          className="h-5 w-5 rounded border-border"
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving..." : "Save settings"}
      </Button>
    </form>
  );
};

export default SettingsForm;
