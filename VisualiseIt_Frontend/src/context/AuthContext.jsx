import { createContext, useContext, useEffect, useRef, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [selectedClass, setSelectedClassState] = useState("");
  const [loading, setLoading] = useState(true);
  const refreshPromiseRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("eduvision_user");
    const storedClass = localStorage.getItem("eduvision_selected_class");
    if (stored) setUser(JSON.parse(stored));
    if (storedClass) setSelectedClassState(storedClass);
    setLoading(false);
  }, []);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

  const login = async ({ email, password }) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Login failed" }));
      throw new Error(err.message || "Login failed");
    }

    const data = await res.json();
    const user = {
      name: data.name || data.username || email.split("@")[0],
      email,
      token: data.token || data.accessToken,
      refreshToken: data.refreshToken,
    };
    localStorage.setItem("eduvision_user", JSON.stringify(user));
    setUser(user);
    return user;
  };

  const register = async ({ name, email, password }) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Registration failed" }));
      throw new Error(err.message || "Registration failed");
    }

    const data = await res.json();
    const user = { name: data.name || name, email, token: data.token || data.accessToken };
    localStorage.setItem("eduvision_user", JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = () => {
    const stored = JSON.parse(localStorage.getItem("eduvision_user") || "null");
    if (stored?.refreshToken) {
      fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: stored.refreshToken }),
      }).catch(() => {});
    }
    localStorage.removeItem("eduvision_user");
    localStorage.removeItem("eduvision_selected_class");
    setUser(null);
    setSelectedClassState("");
  };

  const setSelectedClass = (classId) => {
    localStorage.setItem("eduvision_selected_class", classId);
    setSelectedClassState(classId);
  };

  const updateUserProfile = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem("eduvision_user", JSON.stringify(updatedUser));
  };

  const getToken = () => {
    const stored = localStorage.getItem("eduvision_user");
    if (stored) {
      const userData = JSON.parse(stored);
      return userData.token;
    }
    return null;
  };

  // Save new tokens without losing the other user fields
  const persistTokens = (updates) => {
    const stored = JSON.parse(localStorage.getItem("eduvision_user") || "null");
    if (!stored) return;
    const merged = { ...stored, ...updates };
    localStorage.setItem("eduvision_user", JSON.stringify(merged));
    setUser(merged);
  };

  // Only one refresh call at a time; parallel 401s share the same promise
  const refreshAccessToken = () => {
    if (refreshPromiseRef.current) return refreshPromiseRef.current;

    const stored = JSON.parse(localStorage.getItem("eduvision_user") || "null");
    if (!stored?.refreshToken) return Promise.resolve(null);

    refreshPromiseRef.current = (async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: stored.refreshToken }),
        });
        if (!res.ok) throw new Error("Refresh failed");
        const data = await res.json();
        persistTokens({ token: data.accessToken, refreshToken: data.refreshToken });
        return data.accessToken;
      } catch {
        logout();
        return null;
      } finally {
        refreshPromiseRef.current = null;
      }
    })();

    return refreshPromiseRef.current;
  };

  const authenticatedFetch = async (url, options = {}) => {
    const doFetch = (token) =>
      fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

    let res = await doFetch(getToken());

    if (res.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) res = await doFetch(newToken);
    }
    return res;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      selectedClass,
      setSelectedClass,
      getToken,
      authenticatedFetch,
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
}