"use client";

import { Button } from "@/components/shared/button";
import { cn } from "@/lib/utils/tw";
import { contactFormSchema } from "@/lib/utils/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";

interface ContactFormProps {
  className?: string;
}

type ContactFormSchema = z.infer<typeof contactFormSchema>;

const ContactForm = ({ className }: ContactFormProps) => {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContactFormSchema>({
    resolver: zodResolver(contactFormSchema)
  });

  const onSubmit = async (values: ContactFormSchema) => {
    try {
      setSubmitting(true);
      const response = await fetch("/api/client/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error ?? "Failed to submit");
      }
      toast.success("Thanks for reaching out! We'll be in touch soon.");
      reset();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={cn("space-y-4", className)} onSubmit={handleSubmit(onSubmit)}>
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
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          {...register("email")}
        />
        {errors.email ? <p className="mt-1 text-xs text-red-500">{errors.email.message}</p> : null}
      </div>
      <div>
        <label className="text-sm font-medium text-text" htmlFor="subject">
          Subject
        </label>
        <input
          id="subject"
          type="text"
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          {...register("subject")}
        />
        {errors.subject ? <p className="mt-1 text-xs text-red-500">{errors.subject.message}</p> : null}
      </div>
      <div>
        <label className="text-sm font-medium text-text" htmlFor="message">
          Message
        </label>
        <textarea
          id="message"
          rows={4}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          {...register("message")}
        />
        {errors.message ? <p className="mt-1 text-xs text-red-500">{errors.message.message}</p> : null}
      </div>
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Sending..." : "Send message"}
      </Button>
    </form>
  );
};

export default ContactForm;
