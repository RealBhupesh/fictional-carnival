import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import Providers from "@/components/shared/providers";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "NovaPulse Platform",
    template: "%s | NovaPulse"
  },
  description: "Production-ready full-stack platform with admin analytics and client experiences.",
  icons: {
    icon: "/favicon.ico"
  },
  keywords: [
    "Next.js",
    "Prisma",
    "NextAuth",
    "Socket.io",
    "Tailwind CSS",
    "Full Stack"
  ]
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-text`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
