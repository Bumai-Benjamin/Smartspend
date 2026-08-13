import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SpendProvider } from "./context/SpendContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import AuthPage from "./pages/AuthPage";
import DashboardLayout from "./layouts/DashboardLayout";
import Home from "./pages/dashboard/Home";
import Activity from "./pages/dashboard/Activity";
import Insights from "./pages/dashboard/Insights";
import Plan from "./pages/dashboard/Plan";
import You from "./pages/dashboard/You";
import CategoryDetail from "./pages/dashboard/CategoryDetail";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SpendProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<AuthPage mode="signin" />} />
            <Route path="/signup" element={<AuthPage mode="signup" />} />
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Home />} />
              <Route path="activity" element={<Activity />} />
              <Route path="insights" element={<Insights />} />
              <Route path="plan" element={<Plan />} />
              <Route path="you" element={<You />} />
              <Route path="category/:catKey" element={<CategoryDetail />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SpendProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
