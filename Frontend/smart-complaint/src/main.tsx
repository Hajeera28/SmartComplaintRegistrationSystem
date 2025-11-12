import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import GetStarted from "./pages/GetStarted";
import Login from "./pages/Login";

import CitizenDashboard from "./pages/CitizenDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import OfficerDashboard from "./pages/OfficerDashboard";
import OfficerApproval from "./pages/OfficerApproval";
import ComplaintAssignment from "./pages/ComplaintAssignment";
import CitizenProfile from "./pages/CitizenProfile";
import OfficerProfile from "./pages/OfficerProfile";
import ComplaintHistory from "./pages/ComplaintHistory";
import Services from "./pages/Services";
import React from "react";

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

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);