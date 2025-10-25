"use client";

import Logo from "@/components/shared/logo";
import { Button } from "@/components/shared/button";
import { useTheme } from "next-themes";
import { Sun, MoonStar, LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";

const Topbar = () => {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-border bg-surface px-4">
      <Logo variant="admin" />
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
        </Button>
        <div className="flex items-center gap-2 rounded-full border border-border/80 bg-background px-3 py-1">
          {session?.user?.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name ?? "Avatar"}
              width={28}
              height={28}
              className="h-7 w-7 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-sm font-medium text-primary">
              {session?.user?.name?.[0] ?? "U"}
            </span>
          )}
          <span className="text-sm font-medium text-text">
            {session?.user?.name ?? "Administrator"}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </header>
  );
};

export default Topbar;
