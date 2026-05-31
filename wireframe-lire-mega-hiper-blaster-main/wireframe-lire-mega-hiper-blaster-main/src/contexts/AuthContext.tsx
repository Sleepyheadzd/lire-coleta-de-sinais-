import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  isLoggedIn: boolean;
  isPremium: boolean;
  name: string;
}

interface AuthContextType {
  user: User;
  isAnonymous: boolean;
  login: (name: string) => void;
  logout: () => void;
  enterAnonymous: () => void;
  upgradeToPremium: () => void;
}

const defaultUser: User = { isLoggedIn: false, isPremium: false, name: "" };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(() => {
    const stored = localStorage.getItem("lire_user");
    return stored ? JSON.parse(stored) : defaultUser;
  });
  const [isAnonymous, setIsAnonymous] = useState(() => {
    return localStorage.getItem("lire_anonymous") === "true";
  });

  useEffect(() => {
    localStorage.setItem("lire_user", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem("lire_anonymous", String(isAnonymous));
  }, [isAnonymous]);

  const login = (name: string) => {
    setUser({ isLoggedIn: true, isPremium: false, name });
    setIsAnonymous(false);
  };

  const logout = () => {
    setUser(defaultUser);
    setIsAnonymous(false);
    localStorage.removeItem("selectedModule");
    localStorage.removeItem("selectedProfile");
  };

  const enterAnonymous = () => {
    setUser(defaultUser);
    setIsAnonymous(true);
  };

  const upgradeToPremium = () => {
    setUser((prev) => ({ ...prev, isPremium: true }));
  };

  return (
    <AuthContext.Provider value={{ user, isAnonymous, login, logout, enterAnonymous, upgradeToPremium }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
