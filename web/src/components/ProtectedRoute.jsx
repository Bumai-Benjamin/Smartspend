import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSpend } from "../context/SpendContext";
import { colors } from "../theme";

export default function ProtectedRoute({ children }) {
  const { session, loading: authLoading } = useAuth();
  const { loading: spendLoading, onboarded } = useSpend();
  const location = useLocation();

  if (authLoading || (session && spendLoading)) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: colors.bg }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;

  const isWelcome = location.pathname === "/app/welcome";
  if (!onboarded && !isWelcome) return <Navigate to="/app/welcome" replace />;
  if (onboarded && isWelcome) return <Navigate to="/app" replace />;

  return children;
}
