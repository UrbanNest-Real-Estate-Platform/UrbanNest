import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/icons/logo.jpg";
import "./LoginChoice.css";

function LoginChoice() {

    const navigate = useNavigate();

    return (
        <div className="login-choice-page">

            <div className="login-choice-card">

                <div className="logo">

                    <img
                        src={logo}
                        alt="UrbanNest Logo"
                        className="logo-img"
                    />

                    <h2 className="logo-text">
                        Urban<span>Nest</span>
                    </h2>

                </div>

                <h1>Welcome Back</h1>

                <p className="subtitle">
                    Choose how you want to login.
                </p>

                <div className="choice-container">

                    <div
                        className="choice-card"
                        onClick={() => navigate("/login/user")}
                    >

                        <div className="choice-icon">👤</div>

                        <h3>User</h3>

                        <p>
                            Login to explore, save and buy properties.
                        </p>

                        <button>
                            Login as User
                        </button>

                    </div>

                    <div
                        className="choice-card"
                        onClick={() => navigate("/login/builder")}
                    >

                        <div className="choice-icon">🏢</div>

                        <h3>Builder</h3>

                        <p>
                            Login to manage your projects and listings.
                        </p>

                        <button>
                            Login as Builder
                        </button>

                    </div>

                </div>

                <p className="bottom-text">
                    Don't have an account?
                    <Link to="/register"> Register</Link>
                </p>

            </div>

        </div>
    );

}

export default LoginChoice;