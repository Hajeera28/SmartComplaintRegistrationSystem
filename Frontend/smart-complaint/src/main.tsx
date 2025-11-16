import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from "./auth/ProtectedRoute";
import LandingPage from "./pages/auth/LandingPage";
import GetStarted from "./pages/auth/GetStarted";
import Login from "./pages/auth/Login";

import CitizenDashboard from "./pages/citizen/CitizenDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import OfficerDashboard from "./pages/officer/OfficerDashboard";
import OfficerApproval from "./pages/admin/OfficerApproval";
import ComplaintAssignment from "./pages/admin/ComplaintAssignment";
import CitizenProfile from "./pages/citizen/CitizenProfile";
import OfficerProfile from "./pages/officer/OfficerProfile";
import ComplaintHistory from "./pages/citizen/ComplaintHistory";
import Services from "./pages/shared/Services";
import React from "react";
import { NotificationProvider } from "./contexts/NotificationContext";

const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <LandingPage /> },
  { path: "/get-started", element: <GetStarted /> },

  {
    element: <ProtectedRoute roles={["Citizen"]} />,
    children: [
      { path: "citizen", element: <CitizenDashboard /> },
      { path: "citizen/profile", element: <CitizenProfile /> },
      { path: "complaint-history", element: <ComplaintHistory /> },
      { path: "services", element: <Services /> }
    ]
  },
  {
    element: <ProtectedRoute roles={["Officer"]} />,
    children: [
      { path: "officer", element: <OfficerDashboard /> },
      { path: "officer/profile", element: <OfficerProfile /> }
    ]
  },
  {
    element: <ProtectedRoute roles={["Admin"]} />,
    children: [
      { path: "admin", element: <AdminDashboard /> },
      { path: "admin/officers", element: <OfficerApproval /> },
      { path: "admin/assignments", element: <ComplaintAssignment /> }
    ]
  }
]);

// Suppress browser extension errors
window.addEventListener('error', (e) => {
  if (e.message.includes('disconnected port object') || e.filename?.includes('extension')) {
    e.preventDefault();
    return false;
  }
});

createRoot(document.getElementById("root")!).render(
  <NotificationProvider>
    <RouterProvider router={router} />
    <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
  </NotificationProvider>
);