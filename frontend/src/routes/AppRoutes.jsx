import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "../pages/Landing/LandingPage";

import LoginChoice from "../pages/LoginChoice/LoginChoice";
import RegisterChoice from "../pages/RegisterChoice/RegisterChoice";

import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";

import BuilderLogin from "../pages/Builder/BuilderLogin";
import BuilderRegister from "../pages/Builder/BuilderRegister";

import Dashboard from "../pages/Dashboard/Dashboard";

import ProtectedRoute from "../components/ProtectedRoute";

import BuilderDashboard from "../pages/Builder/BuilderDashboard";
import BuilderProtectedRoute from "../components/BuilderProtectedRoute";

import AdminLogin from "../pages/Admin/AdminLogin";
import AdminDashboard from "../pages/Admin/AdminDashboard";

import AdminProtectedRoute from "../components/AdminProtectedRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={<LoginChoice />} />
        <Route path="/login/user" element={<Login />} />
        <Route path="/login/builder" element={<BuilderLogin />} />

        <Route path="/register" element={<RegisterChoice />} />
        <Route path="/register/user" element={<Register />} />
        <Route path="/register/builder" element={<BuilderRegister />} />

        <Route
            path="/builder/dashboard"
            element={
                <BuilderProtectedRoute>
                    <BuilderDashboard />
                </BuilderProtectedRoute>
            }
        />
        

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/admin" element={<AdminLogin />} />

        <Route
            path="/admin/dashboard"
            element={
                <AdminProtectedRoute>
                    <AdminDashboard />
                </AdminProtectedRoute>
            }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;