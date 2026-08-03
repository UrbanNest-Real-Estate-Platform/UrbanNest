import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/icons/logo.jpg";
import "./RegisterChoice.css";

function RegisterChoice() {

    const navigate = useNavigate();

    return (
        <div className="register-choice-page">

            <div className="register-choice-card">

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

                <h1>Create Account</h1>

                <p className="subtitle">
                    Select the type of account you want to create.
                </p>

                <div className="choice-container">

                    <div
                        className="choice-card"
                        onClick={() => navigate("/register/user")}
                    >
                        <div className="choice-icon">👤</div>

                        <h3>User</h3>

                        <p>
                            Search, save and purchase your dream property.
                        </p>

                        <button>
                            Continue as User
                        </button>
                    </div>

                    <div
                        className="choice-card"
                        onClick={() => navigate("/register/builder")}
                    >
                        <div className="choice-icon">🏢</div>

                        <h3>Builder</h3>

                        <p>
                            List projects and manage your properties.
                        </p>

                        <button>
                            Continue as Builder
                        </button>
                    </div>

                </div>

                <p className="bottom-text">
                    Already have an account?
                    <Link to="/login"> Login</Link>
                </p>

            </div>

        </div>
    );

}

export default RegisterChoice;