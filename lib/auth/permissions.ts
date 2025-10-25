import { Role } from "@prisma/client";

export const ADMIN_ROLES: Role[] = [Role.ADMIN, Role.MANAGER];

export const canAccessAdmin = (role?: Role | null) => {
  if (!role) return false;
  return ADMIN_ROLES.includes(role);
};

export const canManageUsers = (role?: Role | null) => {
  if (!role) return false;
  return role === Role.ADMIN;
};
