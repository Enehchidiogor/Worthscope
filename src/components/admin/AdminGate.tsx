/* Wrap admin pages with this INSIDE the normal AuthGate — it requires both a
   signed-in session AND profiles.role = 'admin'. Non-admins are bounced to
   /dashboard rather than shown any admin UI or data. */

import { Navigate } from "react-router-dom";
import { useIsAdmin } from "@/lib/adminAuth";

export const AdminGate = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading } = useIsAdmin();
  if (loading) return null;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};
