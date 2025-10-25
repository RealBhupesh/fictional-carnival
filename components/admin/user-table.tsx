"use client";

import { Button } from "@/components/shared/button";
import { cn } from "@/lib/utils/tw";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

type Role = "ADMIN" | "MANAGER" | "USER";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    users: User[];
    meta: {
      total: number;
      page: number;
      perPage: number;
    };
  };
}

const roles: Array<{ label: string; value: Role | "ALL" }> = [
  { label: "All roles", value: "ALL" },
  { label: "Admin", value: "ADMIN" },
  { label: "Manager", value: "MANAGER" },
  { label: "User", value: "USER" }
];

const pageSizes = [10, 20, 50];

const UserTable = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [role, setRole] = useState<Role | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timeout);
  }, [search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        perPage: String(perPage)
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (role !== "ALL") params.set("role", role);
      const response = await fetch(`/api/admin/users?${params.toString()}`);
      const json = (await response.json()) as ApiResponse;
      if (!response.ok || !json.success) {
        throw new Error(json?.data ? "Failed to load users" : "Unexpected response");
      }
      setUsers(json.data.users);
      setTotal(json.data.meta.total);
      setPage(json.data.meta.page);
      setPerPage(json.data.meta.perPage);
      setSelected([]);
    } catch (error) {
      console.error(error);
      toast.error((error as Error).message ?? "Unable to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, role, page, perPage]);

  const totalPages = useMemo(() => Math.max(Math.ceil(total / perPage), 1), [total, perPage]);

  const toggleSelection = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    if (selected.length === users.length) {
      setSelected([]);
    } else {
      setSelected(users.map((user) => user.id));
    }
  };

  const deleteUsers = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/users/${id}`, {
            method: "DELETE"
          })
        )
      );
      toast.success(`Deleted ${ids.length} user${ids.length > 1 ? "s" : ""}`);
      fetchUsers();
    } catch (error) {
      toast.error((error as Error).message ?? "Failed to delete users");
    }
  };

  const exportCsv = () => {
    const header = ["Name", "Email", "Role", "Created At"];
    const rows = users.map((user) => [user.name, user.email, user.role, new Date(user.createdAt).toLocaleString()]);
    const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "users.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text">User management</h2>
          <p className="text-sm text-text/70">Search, filter, and manage all workspace members.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={exportCsv}>
            Export CSV
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={selected.length === 0}
            onClick={() => toast.success("Selected users marked as active")}
          >
            Activate
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={selected.length === 0}
            onClick={() => toast("Selected users deactivated")}
          >
            Deactivate
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={selected.length === 0}
            onClick={() => deleteUsers(selected)}
          >
            Remove
          </Button>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <input
            type="search"
            placeholder="Search users"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary md:w-64"
          />
          <select
            value={role}
            onChange={(event) => {
              setRole(event.target.value as Role | "ALL");
              setPage(1);
            }}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {roles.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 text-sm text-text/70">
          <span>Rows per page</span>
          <select
            value={perPage}
            onChange={(event) => {
              setPerPage(Number(event.target.value));
              setPage(1);
            }}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {pageSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-border/80 text-sm">
          <thead className="bg-background/80">
            <tr>
              <th className="px-3 py-2 text-left">
                <input
                  type="checkbox"
                  className="rounded border-border"
                  onChange={toggleAll}
                  checked={selected.length === users.length && users.length > 0}
                  aria-label="Select all users"
                />
              </th>
              <th className="px-3 py-2 text-left font-medium text-text/70">Name</th>
              <th className="px-3 py-2 text-left font-medium text-text/70">Email</th>
              <th className="px-3 py-2 text-left font-medium text-text/70">Role</th>
              <th className="px-3 py-2 text-left font-medium text-text/70">Created</th>
              <th className="px-3 py-2 text-right font-medium text-text/70">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {users.map((user) => (
              <tr key={user.id} className={cn("transition", selected.includes(user.id) ? "bg-primary/10" : undefined)}>
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    className="rounded border-border"
                    checked={selected.includes(user.id)}
                    onChange={() => toggleSelection(user.id)}
                    aria-label={`Select ${user.name}`}
                  />
                </td>
                <td className="px-3 py-2 font-medium text-text">{user.name}</td>
                <td className="px-3 py-2 text-text/70">{user.email}</td>
                <td className="px-3 py-2">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{user.role}</span>
                </td>
                <td className="px-3 py-2 text-text/60">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-3 py-2 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteUsers([user.id])}
                    className="text-red-500 hover:text-red-500"
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
            {!loading && users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-sm text-text/60">
                  No users found for the applied filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-border/60 pt-4 text-sm text-text/70 md:flex-row md:items-center md:justify-between">
        <span>
          Showing {(page - 1) * perPage + 1} - {Math.min(page * perPage, total)} of {total}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((prev) => prev - 1)}>
            Previous
          </Button>
          <span>
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserTable;
