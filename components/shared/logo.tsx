import Link from "next/link";
import { cn } from "@/lib/utils/tw";

interface LogoProps {
  className?: string;
  variant?: "admin" | "client";
}

const Logo = ({ className, variant = "client" }: LogoProps) => {
  return (
    <Link
      href={variant === "admin" ? "/admin/dashboard" : "/"}
      className={cn("flex items-center gap-2 font-display text-lg", className)}
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white font-bold">
        NP
      </span>
      <span className="font-semibold">NovaPulse</span>
    </Link>
  );
};

export default Logo;
