"use client";

import { Button } from "@/components/shared/button";
import { cn } from "@/lib/utils/tw";
import { profileUpdateSchema } from "@/lib/utils/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";

interface ProfileFormProps {
  className?: string;
  defaultValues: {
    name: string;
    email: string;
    image?: string | null;
  };
}

type ProfileUpdateSchema = z.infer<typeof profileUpdateSchema> & { image?: string | null };

const ProfileForm = ({ className, defaultValues }: ProfileFormProps) => {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ProfileUpdateSchema>({
    resolver: zodResolver(profileUpdateSchema.partial({ name: true, password: true, image: true })),
    defaultValues: {
      name: defaultValues.name,
      image: defaultValues.image ?? undefined
    }
  });

  const onSubmit = async (values: ProfileUpdateSchema) => {
    try {
      setLoading(true);
      const filtered = Object.fromEntries(
        Object.entries(values).filter(([_, value]) => value !== undefined && value !== "")
      );
      const response = await fetch("/api/client/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filtered)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error ?? "Unable to update profile");
      }
      toast.success("Profile updated successfully");
      reset({ name: result.data.name, image: result.data.image ?? undefined });
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={cn("space-y-5", className)} onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="text-sm font-medium text-text" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          type="text"
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          {...register("name")}
        />
        {errors.name ? <p className="mt-1 text-xs text-red-500">{errors.name.message}</p> : null}
      </div>
      <div>
        <label className="text-sm font-medium text-text" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={defaultValues.email}
          disabled
          className="mt-1 w-full rounded-md border border-border bg-border/10 px-3 py-2 text-sm text-text/70"
        />
        <p className="mt-1 text-xs text-text/50">Email changes require contacting an administrator.</p>
      </div>
      <div>
        <label className="text-sm font-medium text-text" htmlFor="image">
          Avatar URL
        </label>
        <input
          id="image"
          type="url"
          placeholder="https://..."
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          {...register("image")}
        />
        {errors.image ? <p className="mt-1 text-xs text-red-500">{errors.image.message}</p> : null}
      </div>
      <div>
        <label className="text-sm font-medium text-text" htmlFor="password">
          New password
        </label>
        <input
          id="password"
          type="password"
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          {...register("password")}
        />
        <p className="mt-1 text-xs text-text/50">Leave blank to keep your current password.</p>
        {errors.password ? <p className="mt-1 text-xs text-red-500">{errors.password.message}</p> : null}
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
};

export default ProfileForm;
