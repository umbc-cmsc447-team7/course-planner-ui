import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { login as loginRequest } from "../api/authAPI";
import { clearSession, loadSession, saveSession } from "./session";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadSession);
  // True right after "Sign out", so the next login starts at the home page
  // instead of the previous user's last page.
  const [signedOut, setSignedOut] = useState(false);

  const login = useCallback(async (email, password) => {
    const next = await loginRequest(email, password);
    saveSession(next);
    setSession(next);
    setSignedOut(false);
    return next;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
    setSignedOut(true);
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      role: session?.user?.role ?? null,
      studentProfile: session?.student_profile ?? null,
      signedOut,
      login,
      logout,
    }),
    [session, signedOut, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>.");
  return context;
}
