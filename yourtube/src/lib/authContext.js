"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, provider } from "./firebase.js";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import axiosinstance from "./axiosinstance.js";

const UserContext = createContext(null);
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };
  const logout = async () => {
    setUser(null);
    localStorage.removeItem("user");
    await signOut(auth);
  };
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);

      const firebaseuser = result.user;
      const payload = {
        name: firebaseuser.displayName,
        email: firebaseuser.email,
        image: firebaseuser.photoURL || "https://github.com/shadcn.png",
      };

      const response = await axiosinstance.post("/user/login", payload);

      login(response.data.result);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseuser) => {
      if (firebaseuser) {
        try {
          const payload = {
            name: firebaseuser.displayName,
            email: firebaseuser.email,
            image: firebaseuser.photoURL || "https://github.com/shadcn.png",
          };
          const response = await axiosinstance.post("/user/login", payload);
          login(response.data.result);
        } catch (error) {
          console.error("Error signing in with Google:", error);
          logout();
        }
      }
    });
    return () => unsubscribe();
  }, []);
  return (
    <UserContext.Provider value={{ user, login, logout, handleGoogleSignIn }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
