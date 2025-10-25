import Sidebar from "@/components/admin/sidebar";
import Topbar from "@/components/admin/topbar";
import { canAccessAdmin } from "@/lib/auth/permissions";
import { authOptions } from "@/lib/auth/options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

const AdminLayout = async ({ children }: { children: ReactNode }) => {
  const session = await getServerSession(authOptions);
  if (!session || !canAccessAdmin(session.user.role)) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1 bg-background px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
