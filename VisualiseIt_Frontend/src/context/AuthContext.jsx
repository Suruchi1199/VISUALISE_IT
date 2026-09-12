import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [selectedClass, setSelectedClassState] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("eduvision_user");
    const storedClass = localStorage.getItem("eduvision_selected_class");
    if (stored) setUser(JSON.parse(stored));
    if (storedClass) setSelectedClassState(storedClass);
    setLoading(false);//now had read the user from local storage, so we can set loading to false
  }, []);

  // POST /api/auth/login -> expects { email, password }
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
    const user = { name: data.name || data.username || email.split("@")[0], email, token: data.token || data.accessToken };
    localStorage.setItem("eduvision_user", JSON.stringify(user));
    setUser(user);
    return user;
  };

  // POST /api/auth/register -> expects { name, email, password }
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
    localStorage.removeItem("eduvision_user");
    localStorage.removeItem("eduvision_selected_class");
    setUser(null);
    setSelectedClassState("");
  };

  const setSelectedClass = (classId) => {
    localStorage.setItem("eduvision_selected_class", classId);
    setSelectedClassState(classId);
  };

  // Update user profile in state and localStorage
  const updateUserProfile = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem("eduvision_user", JSON.stringify(updatedUser));
  };

  // Helper function to get token from localStorage
  const getToken = () => {
    const stored = localStorage.getItem("eduvision_user");
    if (stored) {
      const userData = JSON.parse(stored);
      return userData.token;
    }
    return null;
  };

  // Authenticated fetch wrapper that includes JWT token in headers
  const authenticatedFetch = async (url, options = {}) => {
    const token = getToken();
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Include Authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return fetch(url, {
      ...options,
      headers,
    });
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
