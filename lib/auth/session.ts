import { authOptions } from "@/lib/auth/options";
import type { Role } from "@prisma/client";
import { getServerSession } from "next-auth";

export const requireSession = async () => {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("UNAUTHENTICATED");
  }
  return session;
};

export const ensureRole = (role: Role | Role[], userRole: Role) => {
  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(userRole);
};
