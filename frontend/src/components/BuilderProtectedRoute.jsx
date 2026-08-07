import { Navigate } from "react-router-dom";

function BuilderProtectedRoute({ children }) {
    const token = localStorage.getItem("token");
    const builder = JSON.parse(localStorage.getItem("builder")) || JSON.parse(localStorage.getItem("user"));
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token) {
        return <Navigate to="/login/builder" replace />;
    }

    if (!builder) {
        return <Navigate to="/login/builder" replace />;
    }
    if (!user || user.role !== "builder") {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default BuilderProtectedRoute;