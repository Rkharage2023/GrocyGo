import { createContext, useState, useEffect } from "react";
import API from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      await API.post("/auth/logout");
    } catch (err) {
      console.error("Failed to call logout API", err);
    } finally {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      setUser(null);
    }
  };

  const logoutAll = async () => {
    try {
      await API.post("/auth/logout-all");
    } catch (err) {
      console.error("Failed to call logout-all API", err);
    } finally {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      setUser(null);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      let token = sessionStorage.getItem("token");

      if (!token) {
        try {
          const res = await API.post("/auth/refresh");
          if (res.data.success) {
            token = res.data.data.accessToken;
            sessionStorage.setItem("token", token);
          }
        } catch (err) {
          console.error("Failed to auto-login using refresh token on mount", err);
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
          setUser(null);
          setLoading(false);
          return;
        }
      }

      if (token) {
        try {
          const res = await API.get("/auth/profile");
          if (res.data?.success) {
            const fetchedUser = res.data.user || res.data.data?.user;
            if (fetchedUser) {
              setUser(fetchedUser);
              sessionStorage.setItem("user", JSON.stringify(fetchedUser));
            } else {
              sessionStorage.removeItem("token");
              sessionStorage.removeItem("user");
              setUser(null);
            }
          } else {
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
            setUser(null);
          }
        } catch (err) {
          console.error("Failed to load user profile", err);
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const sendOtp = async (mobile) => {
    const res = await API.post("/auth/send-otp", { mobile });
    return res.data;
  };

  const verifyOtp = async (mobile, otp, name = null, password = null) => {
    const payload = { mobile, otp };
    if (name) payload.name = name;
    if (password) payload.password = password;
    const res = await API.post("/auth/verify-otp", payload);
    if (res.data?.success) {
      const accessToken = res.data.data?.accessToken || res.data.accessToken;
      const userData = res.data.data?.user || res.data.user;
      if (accessToken) sessionStorage.setItem("token", accessToken);
      if (userData) {
        sessionStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
      }
      setLoading(false);
    }
    return res.data;
  };

  const updateProfileState = (updatedUser) => {
    setUser(updatedUser);
    sessionStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLoggedIn: !!user,
        logout,
        logoutAll,
        updateProfileState,
        sendOtp,
        verifyOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

