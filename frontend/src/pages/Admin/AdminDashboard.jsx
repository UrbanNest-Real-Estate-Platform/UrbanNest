import { useEffect, useState } from "react";
import { getDashboardStats } from "../../services/adminService";

import AdminSidebar from "./components/AdminSidebar";
import AdminNavbar from "./components/AdminNavbar";

import "./AdminDashboard.css";

function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalBuilders: 0,
        totalProperties: 0
    });

    useEffect(() => {

    const fetchDashboard = async () => {
        try {
            const response = await getDashboardStats();
            setStats(response.data.stats);
        } catch (error) {
            console.log(error);
        }};
        fetchDashboard();
    }, []);

    return (
        <div className="admin-dashboard">

            <AdminSidebar />

            <div className="admin-main">

                <AdminNavbar />

                <div className="admin-content">

                    <div className="dashboard-cards">

                        <div className="dashboard-card">
                            <h3>Total Users</h3>
                            <h2>{stats.totalUsers}</h2>
                            <p>Registered Users</p>
                        </div>

                        <div className="dashboard-card">
                            <h3>Builders</h3>
                            <h2>{stats.totalBuilders}</h2>
                            <p>Verified Builders</p>
                        </div>

                        <div className="dashboard-card">
                            <h3>Properties</h3>
                            <h2>{stats.totalProperties}</h2>
                            <p>Listed Properties</p>
                        </div>

                        <div className="dashboard-card">
                            <h3>Transfers</h3>
                            <h2>0</h2>
                            <p>Pending Requests</p>
                        </div>

                    </div>

                    <div className="dashboard-section">

                        <div className="section-card">
                            <h2>Recent Activities</h2>

                            <p>No activities available.</p>

                        </div>

                        <div className="section-card">
                            <h2>Quick Overview</h2>

                            <p>
                                Welcome to the UrbanNest Admin Panel.
                                Analytics and reports will appear here.
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default AdminDashboard;