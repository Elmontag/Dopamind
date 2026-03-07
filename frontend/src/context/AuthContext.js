import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext();

const USER_KEY = "dopamind-user";

const DEFAULT_USER = { id: "local", name: "User", email: "local@dopamind.app", role: "admin" };

function loadOrCreateUser() {
  try {
    const saved = localStorage.getItem(USER_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  localStorage.setItem(USER_KEY, JSON.stringify(DEFAULT_USER));
  return DEFAULT_USER;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadOrCreateUser);

  const logout = useCallback(() => {
    localStorage.removeItem("dopamind-settings");
    localStorage.removeItem("dopamind-state");
    localStorage.removeItem("dopamind-timetracking");
    const fresh = { ...DEFAULT_USER };
    localStorage.setItem(USER_KEY, JSON.stringify(fresh));
    setUser(fresh);
  }, []);

  const login = useCallback(async (email) => {
    const u = { id: "local", name: email.split("@")[0] || "User", email, role: "admin" };
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
    return { user: u };
  }, []);

  const register = useCallback(async (email, name) => {
    const u = { id: "local", name: name || email.split("@")[0] || "User", email, role: "admin" };
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
    return { user: u };
  }, []);

  const completeSetup = useCallback(async (email, name) => {
    return register(email, name);
  }, [register]);

  const updateProfile = useCallback(async (name) => {
    const updated = { ...user, name };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    setUser(updated);
    return updated;
  }, [user]);

  const deleteAccount = useCallback(async () => {
    logout();
    return {};
  }, [logout]);

  const changePassword = useCallback(async () => ({}), []);

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{ user, token: null, loading: false, setupNeeded: false, registrationEnabled: false, backendOffline: false, login, register, completeSetup, logout, deleteAccount, changePassword, updateProfile, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
