// src/App.jsx

import React, { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

/* ✅ Firebase Auth */
import { auth } from "./Firebase";
import { onAuthStateChanged } from "firebase/auth";

/* ✅ Presence System */
import { setUserOnline, setUserOffline } from "./utils/presence";

/* ✅ Theme Provider ONLY for Chat Pages */
import ThemeProvider from "./components/Theme/ThemeContext.jsx";

/* ✅ Public Pages */
import HomePage from "./components/HomePage";
import Navbar from "./components/Navbar";
import ReadMore from "./components/ReadMore";

/* ✅ Auth Pages */
import Signup from "./components/SignupFile/Signup";
import SignupEmail from "./components/SignupFile/SignupEmail";
import SignupPhone from "./components/SignupFile/SignupPhone";
import Login from "./components/SignupFile/Login";

/* ✅ Chat Pages */
import Chat from "./components/Chat/Chat";
import ChatNavbar from "./components/Chat/ChatNavbar";

/* ✅ Protected Routes */
import ProtectedRoute from "./components/Protected/ProtectedRoute";

/* ✅ Profile Pages */
import ProfileSetup from "./components/Profile/ProfileSetup";
import Profile from "./components/Profile/Profile";

/* ✅ Issue Selection */
import IssueSelection from "./components/Profile/IssueSelection";

/* ✅ Admin */
import AdminDashboard from "./components/Admin/AdminDashboard";
import AdminLogin from "./components/Admin/AdminLogin";
import AdminProtectedRoute from "./components/Protected/AdminProtectedRoute";

/* ✅ Random Chat */
import RandomPage from "./components/Random/RandomPage";

/* ✅ NEW 🔥 Peace Hub */
import PeaceHub from "./components/PeaceHub/PeaceHub";

/* ================================
   ✅ Router Setup
================================ */
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Navbar />
        <HomePage />
      </>
    ),
  },

  {
    path: "/readmore",
    element: (
      <>
        <Navbar />
        <ReadMore />
      </>
    ),
  },

  {
    path: "/signup",
    element: (
      <>
        <Navbar />
        <Signup />
      </>
    ),
  },

  {
    path: "/signupemail",
    element: (
      <>
        <Navbar />
        <SignupEmail />
      </>
    ),
  },

  {
    path: "/signupphone",
    element: (
      <>
        <Navbar />
        <SignupPhone />
      </>
    ),
  },

  {
    path: "/login",
    element: (
      <>
        <Navbar />
        <Login />
      </>
    ),
  },

  /* ================================
     🔥 ISSUE SELECTION
  ================================ */
  {
    path: "/select-issues",
    element: (
      <ProtectedRoute>
        <ThemeProvider>
          <ChatNavbar />
          <IssueSelection />
        </ThemeProvider>
      </ProtectedRoute>
    ),
  },

  /* ================================
     🎲 RANDOM CHAT
  ================================ */
  {
    path: "/random",
    element: (
      <ProtectedRoute>
        <ThemeProvider>
          <div className="chat-layout">
            <ChatNavbar />
            <RandomPage />
          </div>
        </ThemeProvider>
      </ProtectedRoute>
    ),
  },

  /* ================================
     💚 PEACE HUB (NEW FEATURE)
  ================================ */
  {
    path: "/peace",
    element: (
      <ProtectedRoute>
        <ThemeProvider>
          <div className="chat-layout">
            <ChatNavbar />
            <PeaceHub />
          </div>
        </ThemeProvider>
      </ProtectedRoute>
    ),
  },

  /* ================================
     👤 PROFILE SETUP
  ================================ */
  {
    path: "/profile-setup",
    element: (
      <ProtectedRoute>
        <ThemeProvider>
          <ChatNavbar />
          <ProfileSetup />
        </ThemeProvider>
      </ProtectedRoute>
    ),
  },

  /* ================================
     💬 CHAT
  ================================ */
  {
    path: "/chat",
    element: (
      <ProtectedRoute>
        <ThemeProvider>
          <ChatNavbar />
          <Chat />
        </ThemeProvider>
      </ProtectedRoute>
    ),
  },

  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <ThemeProvider>
          <ChatNavbar />
          <Profile />
        </ThemeProvider>
      </ProtectedRoute>
    ),
  },

  /* ================================
     🛡️ ADMIN
  ================================ */
  {
    path: "/admin",
    element: (
      <AdminProtectedRoute>
        <ThemeProvider>
          <ChatNavbar />
          <AdminDashboard />
        </ThemeProvider>
      </AdminProtectedRoute>
    ),
  },

  {
    path: "/admin-login",
    element: (
      <>
        <Navbar />
        <AdminLogin />
      </>
    ),
  },
]);

/* ================================
   ✅ Main App Component
================================ */
export default function App() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserOnline(user.uid);

        const handleClose = () => {
          setUserOffline(user.uid);
        };

        window.addEventListener("beforeunload", handleClose);

        return () => {
          handleClose();
          window.removeEventListener("beforeunload", handleClose);
        };
      }
    });

    return () => unsubscribe();
  }, []);

  return <RouterProvider router={router} />;
}