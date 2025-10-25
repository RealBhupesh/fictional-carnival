import ContentManager from "@/components/admin/content-manager";

const ContentPage = () => {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-semibold text-text">Content management</h1>
        <p className="mt-2 text-sm text-text/70">
          Create, schedule, and organize content for client-facing experiences. Updates propagate instantly.
        </p>
      </section>
      <ContentManager />
    </div>
  );
};

export default ContentPage;
