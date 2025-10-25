"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import SocketProvider from "@/components/shared/socket-provider";

interface ProvidersProps {
  children: ReactNode;
}

const Providers = ({ children }: ProvidersProps) => {
  return (
    <SessionProvider>
      <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem>
        <SocketProvider>
          {children}
          <Toaster position="top-right" />
        </SocketProvider>
      </ThemeProvider>
    </SessionProvider>
  );
};

export default Providers;
