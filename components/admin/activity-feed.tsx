interface ActivityFeedProps {
  items: Array<{
    id: string;
    action: string;
    details: string | null;
    createdAt: Date;
    user?: {
      id: string;
      name: string | null;
      email: string | null;
      role: string;
    } | null;
  }>;
}

const ActivityFeed = ({ items }: ActivityFeedProps) => {
  return (
    <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-text">Recent activity</h2>
      <div className="mt-4 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {item.user?.name?.[0] ?? "N"}
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-text">
                {item.user?.name ?? "System"}
                <span className="ml-2 rounded-full bg-border px-2 py-0.5 text-xs text-text/60">
                  {item.user?.role ?? "SYSTEM"}
                </span>
              </p>
              <p className="text-sm text-text/70">{item.details ?? item.action}</p>
              <p className="text-xs text-text/50">{item.createdAt.toLocaleString()}</p>
            </div>
          </div>
        ))}
        {items.length === 0 ? <p className="text-sm text-text/60">No activity recorded yet.</p> : null}
      </div>
    </div>
  );
};

export default ActivityFeed;
