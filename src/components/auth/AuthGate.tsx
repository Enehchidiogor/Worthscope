/* Guards protected dashboard routes. Redirects unauthenticated users to
   /signin. While the session is loading, render nothing to avoid flashing
   the wrong UI. */

import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthSession, hydrateProfile } from "@/lib/authClient";
import { loadUserProfile } from "@/lib/profileStore";
import { hydrateStudentStateFromServer, installStudentStateAutoSync } from "@/lib/studentState";

export const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuthSession();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      hydrateProfile(user);
      loadUserProfile(true);
      // Pull cross-device journey state, then start auto-sync on every change.
      hydrateStudentStateFromServer().finally(() => {
        installStudentStateAutoSync();
      });
    }
  }, [user]);

  if (loading) return null;
  if (!user) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
};

