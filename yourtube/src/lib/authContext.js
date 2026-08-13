"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth, provider } from "./firebase.js";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import axiosinstance from "./axiosinstance.js";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // OTP related states
  const [requiresOTP, setRequiresOTP] = useState(false);
  const [pendingUserId, setPendingUserId] = useState(null);

  const [pendingLoginData, setPendingLoginData] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // ---------------------------------------
  // APPLY THEME
  // ---------------------------------------
  const applyTheme = (theme) => {
    const selectedTheme = theme || "dark";

    if (selectedTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }

    localStorage.setItem("theme", selectedTheme);
  };
  // ---------------------------------------
  // CHANGE THEME
  // ---------------------------------------
  const changeTheme = async (theme) => {
    try {
      if (!user?._id) {
        console.error("User not found");
        return;
      }

      // Apply theme immediately
      applyTheme(theme);

      // Save theme in database
      const response = await axiosinstance.patch(
        `/user/update-theme/${user._id}`,
        {
          theme,
        },
      );

      if (response.data.success) {
        // Update user with latest database data
        setUser(response.data.result);

        localStorage.setItem("user", JSON.stringify(response.data.result));
      }
    } catch (error) {
      console.error("Theme update failed:", error);
    }
  };
  // ---------------------------------------
  // LOGIN USER
  // ---------------------------------------
  const login = (userData) => {
    setUser(userData);

    localStorage.setItem("user", JSON.stringify(userData));

    applyTheme(userData?.theme || "dark");
  };

  // ---------------------------------------
  // LOGOUT
  // ---------------------------------------
  const logout = async () => {
    setUser(null);

    setRequiresOTP(false);
    setPendingUserId(null);
    setPendingLoginData(null);

    localStorage.removeItem("user");
    localStorage.removeItem("theme");

    await signOut(auth);
  };

  // ---------------------------------------
  // PROCESS LOGIN RESPONSE
  // ---------------------------------------
  const processLoginResponse = (response, loginData) => {
    const data = response.data;

    // New device / city / state
    if (data.requiresOTP) {
      setRequiresOTP(true);

      // Backend sends userId
      setPendingUserId(data.userId);

      // Save current login information
      // so it can be sent again after OTP verification
      setPendingLoginData(loginData);

      return;
    }

    // Normal login
    if (data.result) {
      login(data.result);
    }
  };

  // ---------------------------------------
  // GET CITY AND STATE
  // ---------------------------------------
  const getLocation = async () => {
    try {
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();

      return {
        city: data.city || null,
        state: data.region || null,
      };
    } catch (error) {
      console.error("Location detection failed:", error);

      return {
        city: null,
        state: null,
      };
    }
  };
  // ---------------------------------------
  // GOOGLE LOGIN
  // ---------------------------------------
  const handleGoogleSignIn = async () => {
    if (googleLoading) return;

    try {
      setGoogleLoading(true);

      const result = await signInWithPopup(auth, provider);

      const firebaseuser = result.user;

      let deviceId = localStorage.getItem("deviceId");

      if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem("deviceId", deviceId);
      }

      const location = await getLocation();

      const payload = {
        name: firebaseuser.displayName,
        email: firebaseuser.email,
        image: firebaseuser.photoURL || "https://github.com/shadcn.png",
        city: location.city,
        state: location.state,
        deviceId,
      };

      const response = await axiosinstance.post("/user/login", payload);

      processLoginResponse(response, payload);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    } finally {
      setGoogleLoading(false);
    }
  };
  // ---------------------------------------
  // VERIFY OTP
  // ---------------------------------------
  const verifyLoginOTP = async (otp) => {
    try {
      const response = await axiosinstance.post("/user/verify-otp", {
        userId: pendingUserId,
        otp,

        city: pendingLoginData?.city || null,
        state: pendingLoginData?.state || null,
        deviceId: pendingLoginData?.deviceId || null,
      });

      if (response.data.success) {
        login(response.data.result);

        setRequiresOTP(false);
        setPendingUserId(null);
        setPendingLoginData(null);

        return {
          success: true,
        };
      }

      return {
        success: false,
        message: "OTP verification failed",
      };
    } catch (error) {
      console.error("OTP verification error:", error);

      return {
        success: false,
        message: error.response?.data?.message || "Invalid OTP",
      };
    }
  };
  // ---------------------------------------
  // RESTORE USER
  // ---------------------------------------
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        setUser(parsedUser);

        applyTheme(parsedUser?.theme || "dark");
      } catch (error) {
        console.error("Error reading stored user:", error);

        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, []);

  // ---------------------------------------
  // FIREBASE AUTH STATE
  // ---------------------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseuser) => {
      if (!firebaseuser) {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,

        // Google authentication
        handleGoogleSignIn,

        // OTP
        requiresOTP,
        pendingUserId,
        verifyLoginOTP,

        setRequiresOTP,
        setPendingUserId,

        // Login
        processLoginResponse,

        // Theme
        applyTheme,
        changeTheme,
        googleLoading,

        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
