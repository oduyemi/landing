"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";


export type UserRole = "user" | "admin";


export interface AuthUser {
  _id: string;
  fname: string;
  lname: string;
  email: string;
  role: UserRole;
  image?: string | null;
  firstLogin?: boolean;
  lastLogin?: string | null;
  createdAt?: string;
  updatedAt?: string;
}


interface LoginResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<LoginResult>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);


export function AuthProvider({children}: {children: React.ReactNode;}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        setUser(null);
        return null;
      }

      const data = await response.json();
      if (!data.user) {
        setUser(null);
        return null;
      }

      setUser(data.user);
      return data.user as AuthUser;
    } catch (error) {
      console.error(
        "REFRESH AUTH USER ERROR:",
        error
      );

      setUser(null);

      return null;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);

      try {
        await refreshUser();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [refreshUser]);

  const login = useCallback(
    async (
      email: string,
      password: string
    ): Promise<LoginResult> => {
      try {
        const response = await fetch(
          "/api/auth/login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              email: email.trim().toLowerCase(),
              password,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          return {
            success: false,
            error:
              data?.error ||
              "Unable to log in. Please try again.",
          };
        }

        if (!data.user) {
          return {
            success: false,
            error:
              "Login succeeded, but no user information was returned.",
          };
        }

        setUser(data.user);

        return {
          success: true,
          user: data.user,
        };
      } catch (error) {
        console.error("LOGIN ERROR:", error);

        return {
          success: false,
          error:
            "Something went wrong. Please check your connection and try again.",
        };
      }
    },
    []
  );

  
  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider"
    );
  }

  return context;
}