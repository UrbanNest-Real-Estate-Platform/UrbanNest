import { Bell, Search } from "lucide-react";

import "./AdminNavbar.css";

function AdminNavbar() {

    const admin = JSON.parse(localStorage.getItem("admin"));

    return (
        <header className="admin-navbar">

            <div className="navbar-left">

                <h1>Dashboard</h1>

                <p>Welcome back, {admin?.name || "Admin"}</p>

            </div>

            <div className="navbar-right">

                <div className="search-box">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search..."
                    />

                </div>

                <button className="notification-btn">

                    <Bell size={22} />

                    <span className="notification-dot"></span>

                </button>

                <div className="admin-profile">

                    <div className="admin-avatar">

                        {admin?.name?.charAt(0).toUpperCase()}

                    </div>

                    <div>

                        <h4>{admin?.name}</h4>

                        <p>Administrator</p>

                    </div>

                </div>

            </div>

        </header>
    );
}

export default AdminNavbar;