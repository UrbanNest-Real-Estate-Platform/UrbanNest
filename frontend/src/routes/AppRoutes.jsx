import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "../pages/Landing/LandingPage";

import LoginChoice from "../pages/LoginChoice/LoginChoice";
import RegisterChoice from "../pages/RegisterChoice/RegisterChoice";

import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import ResetPassword from "../pages/ResetPassword/ResetPassword";

import BuilderLogin from "../pages/Builder/BuilderLogin";
import BuilderRegister from "../pages/Builder/BuilderRegister";
import BuilderDashboard from "../pages/Builder/BuilderDashboard";

import Dashboard from "../pages/Dashboard/Dashboard";
import Search from "../pages/Search/Search";
import PropertyDetail from "../pages/PropertyDetail/PropertyDetail";
import MyProperties from "../pages/MyProperties/MyProperties";
import PostProperty from "../pages/PostProperty/PostProperty";
import Profile from "../pages/Profile/Profile";

import ProtectedRoute from "../components/ProtectedRoute";
import BuilderProtectedRoute from "../components/BuilderProtectedRoute";
import AdminProtectedRoute from "../components/AdminProtectedRoute";

import AdminLogin from "../pages/Admin/AdminLogin";
import AdminDashboard from "../pages/Admin/AdminDashboard";


function AppRoutes() {

    return (
        <BrowserRouter>

            <Routes>

                {/* Landing */}
                <Route path="/" element={<LandingPage />} />


                {/* Login */}
                <Route path="/login" element={<LoginChoice />} />
                <Route path="/login/user" element={<Login />} />
                <Route path="/login/builder" element={<BuilderLogin />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />

                <Route
                    path="/login"
                    element={<LoginChoice />}
                />
        <Route
          path="/my-properties"
          element={
            <ProtectedRoute>
              <MyProperties />
            </ProtectedRoute>
          }
        />

        <Route
          path="/post-property"
          element={
            <ProtectedRoute>
              <PostProperty />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-property/:id"
          element={
            <ProtectedRoute>
              <PostProperty />
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
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          }
        />

                {/* Register */}
                <Route path="/register" element={<RegisterChoice />} />
                <Route path="/register/user" element={<Register />} />
                <Route path="/register/builder" element={<BuilderRegister />} />


                {/* User */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />


                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/search"
                    element={
                        <ProtectedRoute>
                            <Search />
                        </ProtectedRoute>
                    }
                />


                <Route
                    path="/property/:id"
                    element={
                        <ProtectedRoute>
                            <PropertyDetail />
                        </ProtectedRoute>
                    }
                />


                <Route
                    path="/my-properties"
                    element={
                        <ProtectedRoute>
                            <MyProperties />
                        </ProtectedRoute>
                    }
                />


                <Route
                    path="/post-property"
                    element={
                        <ProtectedRoute>
                            <PostProperty />
                        </ProtectedRoute>
                    }
                />


                <Route
                    path="/edit-property/:id"
                    element={
                        <ProtectedRoute>
                            <PostProperty />
                        </ProtectedRoute>
                    }
                />


                {/* Builder */}
                <Route
                    path="/builder/dashboard"
                    element={
                        <BuilderProtectedRoute>
                            <BuilderDashboard />
                        </BuilderProtectedRoute>
                    }
                />


                {/* Admin */}
                <Route
                    path="/admin"
                    element={<AdminLogin />}
                />


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