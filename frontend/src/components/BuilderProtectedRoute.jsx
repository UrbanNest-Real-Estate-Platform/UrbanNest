import { Navigate } from "react-router-dom";

function BuilderProtectedRoute({ children }) {

    const token = localStorage.getItem("token");
    const builder = JSON.parse(localStorage.getItem("builder"));

    if (!token) {
        return <Navigate to="/login/builder" replace />;
    }

    if (!builder) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default BuilderProtectedRoute;