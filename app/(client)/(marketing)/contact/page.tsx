import ContactForm from "@/components/client/contact-form";

export default function ContactPage() {
  return (
    <div className="mx-auto grid max-w-5xl gap-12 px-4 py-16 md:grid-cols-2">
      <section>
        <h1 className="text-3xl font-semibold text-text">Let’s connect</h1>
        <p className="mt-4 text-base text-text/70">
          Tell us about your goals and we’ll craft a tailored onboarding plan. Our solutions architects typically respond within one
          business day.
        </p>
        <div className="mt-6 space-y-4 text-sm text-text/70">
          <p>
            <strong className="text-text">Support:</strong> support@novapulse.io
          </p>
          <p>
            <strong className="text-text">Sales:</strong> sales@novapulse.io
          </p>
          <p>
            <strong className="text-text">Office:</strong> 100 Innovation Drive, Suite 400, San Francisco, CA
          </p>
        </div>
      </section>
      <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
        <ContactForm />
      </section>
    </div>
  );
}
