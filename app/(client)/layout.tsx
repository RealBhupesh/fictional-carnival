import SiteFooter from "@/components/client/site-footer";
import SiteHeader from "@/components/client/site-header";
import type { ReactNode } from "react";

const ClientLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
};

export default ClientLayout;
