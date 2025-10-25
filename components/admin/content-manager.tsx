"use client";

import MediaUpload from "@/components/admin/media-upload";
import RichTextEditor from "@/components/admin/rich-text-editor";
import { Button } from "@/components/shared/button";
import { cn } from "@/lib/utils/tw";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  image?: string | null;
  published: boolean;
  publishDate?: string | null;
  updatedAt: string;
}

interface ContentFormState {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image?: string;
  published: boolean;
  publishDate: string;
}

const initialFormState: ContentFormState = {
  title: "",
  slug: "",
  excerpt: "",
  content: "<p>Start writing amazing content...</p>",
  image: undefined,
  published: false,
  publishDate: ""
};

const ContentManager = () => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ContentFormState>(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/content");
      const json = await response.json();
      if (!response.ok || !json?.success) {
        throw new Error(json?.error ?? "Unable to load content");
      }
      const contents = (json.data?.contents ?? []) as ContentItem[];
      setItems(contents);
    } catch (error) {
      toast.error((error as Error).message ?? "Failed to fetch content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSaving(true);
      const { image, publishDate, ...rest } = form;
      const payload = {
        ...rest,
        image: image ?? undefined,
        publishDate: publishDate ? new Date(publishDate).toISOString() : null
      };
      const endpoint = editingId ? `/api/admin/content/${editingId}` : "/api/admin/content";
      const method = editingId ? "PATCH" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await response.json();
      if (!response.ok || !json?.success) {
        throw new Error(json?.error ?? "Unable to save content");
      }
      toast.success(editingId ? "Content updated" : "Content created");
      setForm({ ...initialFormState });
      setEditingId(null);
      fetchContent();
    } catch (error) {
      toast.error((error as Error).message ?? "Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: ContentItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt ?? "",
      content: item.content,
      image: item.image ?? undefined,
      published: item.published,
      publishDate: item.publishDate ? format(new Date(item.publishDate), "yyyy-MM-dd") : ""
    });
  };

  const togglePublish = async (item: ContentItem) => {
    try {
      const response = await fetch(`/api/admin/content/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !item.published })
      });
      const json = await response.json();
      if (!response.ok || !json?.success) {
        throw new Error(json?.error ?? "Unable to update publish state");
      }
      toast.success(!item.published ? "Content published" : "Content reverted to draft");
      fetchContent();
    } catch (error) {
      toast.error((error as Error).message ?? "Failed to update content");
    }
  };

  const deleteContent = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/content/${id}`, { method: "DELETE" });
      const json = await response.json();
      if (!response.ok || !json?.success) {
        throw new Error(json?.error ?? "Unable to delete content");
      }
      toast.success("Content deleted");
      fetchContent();
    } catch (error) {
      toast.error((error as Error).message ?? "Failed to delete content");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
      <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text">{editingId ? "Edit content" : "Create content"}</h2>
        <p className="mt-2 text-sm text-text/70">
          {editingId ? "Update existing article details." : "Draft new articles with rich formatting."}
        </p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-text" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              required
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text" htmlFor="slug">
              Slug
            </label>
            <input
              id="slug"
              value={form.slug}
              onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
              required
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text" htmlFor="excerpt">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              value={form.excerpt}
              onChange={(event) => setForm((prev) => ({ ...prev, excerpt: event.target.value }))}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              rows={3}
            />
          </div>
          <MediaUpload value={form.image} onChange={(image) => setForm((prev) => ({ ...prev, image }))} />
          <div>
            <label className="text-sm font-medium text-text" htmlFor="publishDate">
              Publish date
            </label>
            <input
              type="date"
              id="publishDate"
              value={form.publishDate}
              onChange={(event) => setForm((prev) => ({ ...prev, publishDate: event.target.value }))}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text">Body</label>
            <RichTextEditor
              value={form.content}
              onChange={(value) => setForm((prev) => ({ ...prev, content: value }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-sm text-text/70">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(event) => setForm((prev) => ({ ...prev, published: event.target.checked }))}
                className="rounded border-border"
              />
              Publish immediately
            </label>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </section>
      <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text">Content library</h2>
        <p className="mt-2 text-sm text-text/70">Manage published and draft content items.</p>
        <div className="mt-4 space-y-4">
          {loading ? <p className="text-sm text-text/60">Loading content...</p> : null}
          {!loading && items.length === 0 ? (
            <p className="text-sm text-text/60">No content yet. Create your first article using the form.</p>
          ) : null}
          {items.map((item) => (
            <article key={item.id} className="rounded-2xl border border-border/80 bg-background p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold text-text">{item.title}</h3>
                  <p className="text-xs text-text/50">/{item.slug}</p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs",
                    item.published ? "bg-secondary/10 text-secondary" : "bg-border text-text/60"
                  )}
                >
                  {item.published ? "Published" : "Draft"}
                </span>
              </div>
              {item.image ? (
                <div className="mt-3 overflow-hidden rounded-2xl border border-border/80">
                  <img src={item.image} alt={`${item.title} cover`} className="h-32 w-full object-cover" />
                </div>
              ) : null}
              <p className="mt-2 text-sm text-text/70">{item.excerpt ?? "No excerpt provided."}</p>
              <p className="mt-2 text-xs text-text/50">
                Updated {format(new Date(item.updatedAt), "MMM d, yyyy HH:mm")}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => togglePublish(item)}>
                  {item.published ? "Unpublish" : "Publish"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deleteContent(item.id)} className="text-red-500">
                  Delete
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ContentManager;
