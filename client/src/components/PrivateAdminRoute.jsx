// src/components/PrivateAdminRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

export default function PrivateAdminRoute({ children }) {
  // Example logic: Replace with your real authentication logic!
  const user = JSON.parse(localStorage.getItem("user")); // or get from context/redux
  const isAdmin = user && user.role === "admin";

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
