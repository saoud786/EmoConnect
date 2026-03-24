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

import AdminDashboard from "./components/Admin/AdminDashboard";
import AdminLogin from "./components/Admin/AdminLogin";
import AdminProtectedRoute from "./components/Protected/AdminProtectedRoute";
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
     ✅ Protected Chat Area
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


/*Admin Dashboard*/
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
  // ✅ Presence Tracker (Professional)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // ✅ User logged in → Online
        setUserOnline(user.uid);

        // ✅ When tab closes → Offline + LastSeen
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
