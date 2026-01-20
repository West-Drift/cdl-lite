// components/ui/role-section.tsx
import { ReactNode } from "react";

/**
 * Conditionally render children based on user role.
 * @example
 * <RoleSection roles={['admin']} userRole={role}>
 *   <AdminOnlyPanel />
 * </RoleSection>
 */
export function RoleSection({
  roles,
  userRole,
  children,
}: {
  roles: ("public" | "registered" | "verified" | "admin")[];
  userRole: "public" | "registered" | "verified" | "admin";
  children: ReactNode;
}) {
  if (!roles.includes(userRole)) return null;
  return <>{children}</>;
}
