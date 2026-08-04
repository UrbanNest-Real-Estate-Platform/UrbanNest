import { useEffect, useState } from "react";
import axios from "axios";

import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer
} from "recharts";


import {
    LayoutDashboard,
    ShieldCheck,
    ShieldAlert,
    ArrowLeftRight,
    TrendingUp,
    Cpu,
    FileText,
    LogOut,
    Search,
    Bell,
    Users,
    Building2,
    Coins,
    Key,
    Activity
} from "lucide-react";

import "./AdminDashboard.css";

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalBuilders: 0,
        totalProperties: 0,
        pendingBuilders: 0,
        listingMix : []
    });
    const listingData = stats.listingMix;

    const COLORS = [
        "#2563eb",
        "#06b6d4",
        "#8b5cf6"
    ];

    const [time, setTime] = useState(new Date());
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(
                    "http://localhost:3120/api/admin/dashboard",
                    {
                        headers:{
                            Authorization:`Bearer ${token}`
                        }
                    }
                );
                console.log(res.data);
                setStats(res.data.stats);
            }
            catch(error){
                console.log(error);
            }
        };

        fetchStats();
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        }).toLowerCase();
    };

    const formatDate = (date) => {
        const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
        const day = date.getDate();
        const month = date.toLocaleDateString("en-US", { month: "short" });
        const year = date.getFullYear();
        return `${weekday}, ${day} ${month}, ${year}`;
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("admin");
        window.location.href = "/admin";
    };

    const admin = JSON.parse(localStorage.getItem("admin")) || {};
    const adminEmail = admin.email || "priya@urbannest.in";
    const adminName = adminEmail === "priya@urbannest.in" ? "Priya Mehta" : (
        adminEmail.split("@")[0].split(/[._-]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
    );
    const adminInitials = adminName.split(" ").map(n => n[0]).join("").toUpperCase();

    // Map labels for placeholder screens
    const tabNames = {
        verification: "User & Builder Verification",
        moderation: "Property Moderation",
        transfer: "Transfer Queue",
        analytics: "Analytics & Reports",
        ml: "ML Operations",
        logs: "System Logs"
    };

    return (
        <div className="admin-console-layout">
            {/* Sidebar Section */}
            <aside className="admin-sidebar">
                <div className="sidebar-brand">
                    <div className="brand-logo-container">
                        <Building2 className="brand-logo-icon" size={24} />
                    </div>
                    <div className="brand-text">
                        <h2>Urban<span>Nest</span></h2>
                        <span className="sub-brand">
                            <span className="dot-small"></span> Admin Console
                        </span>
                    </div>
                </div>

                <div className="system-status-indicator">
                    <span className="status-label">
                        <span className="pulse-dot"></span> All systems normal
                    </span>
                    <span className="status-time">{formatTime(time)}</span>
                </div>

                <nav className="sidebar-nav">
                    <button 
                        className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
                        onClick={() => setActiveTab("overview")}
                    >
                        <LayoutDashboard size={18} />
                        <span>Platform Overview</span>
                    </button>
                    
                    <button 
                        className={`nav-item ${activeTab === "verification" ? "active" : ""}`}
                        onClick={() => setActiveTab("verification")}
                    >
                        <ShieldCheck size={18} />
                        <span>User & Builder Verification</span>
                        <span className="badge badge-blue">5</span>
                    </button>

                    <button 
                        className={`nav-item ${activeTab === "moderation" ? "active" : ""}`}
                        onClick={() => setActiveTab("moderation")}
                    >
                        <ShieldAlert size={18} />
                        <span>Property Moderation</span>
                        <span className="badge badge-red">4</span>
                    </button>

                    <button 
                        className={`nav-item ${activeTab === "transfer" ? "active" : ""}`}
                        onClick={() => setActiveTab("transfer")}
                    >
                        <ArrowLeftRight size={18} />
                        <span>Transfer Queue</span>
                        <span className="badge badge-gray">2</span>
                    </button>

                    <button 
                        className={`nav-item ${activeTab === "analytics" ? "active" : ""}`}
                        onClick={() => setActiveTab("analytics")}
                    >
                        <TrendingUp size={18} />
                        <span>Analytics & Reports</span>
                    </button>

                    <button 
                        className={`nav-item ${activeTab === "ml" ? "active" : ""}`}
                        onClick={() => setActiveTab("ml")}
                    >
                        <Cpu size={18} />
                        <span>ML Operations</span>
                        <span className="badge badge-gray">1</span>
                    </button>

                    <button 
                        className={`nav-item ${activeTab === "logs" ? "active" : ""}`}
                        onClick={() => setActiveTab("logs")}
                    >
                        <FileText size={18} />
                        <span>System Logs</span>
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <div className="admin-profile">
                        <div className="profile-avatar">
                            {adminInitials || "PM"}
                        </div>
                        <div className="profile-info">
                            <h4>{adminName}</h4>
                            <p>{adminEmail}</p>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={16} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Pane */}
            <main className="admin-main-pane">
                {/* Header bar */}
                <header className="main-header">
                    <div className="header-title-section">
                        <h1>{activeTab === "overview" ? "Platform Overview" : tabNames[activeTab]}</h1>
                        <p className="calendar-date">{formatDate(time)}</p>
                    </div>
                    
                    <div className="header-controls">
                        <div className="search-bar">
                            <Search size={16} className="search-icon" />
                            <input type="text" placeholder="Search users, listings..." />
                        </div>
                        <div className="notification-bell">
                            <Bell size={18} />
                            <span className="bell-badge"></span>
                        </div>
                    </div>
                </header>

                {/* Dashboard Views */}
                {activeTab === "overview" ? (
                    <div className="dashboard-content-flow">
                        {/* Metrics Cards Grid */}
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="card-top">
                                    <div className="card-icon-container blue-theme">
                                        <Users size={18} />
                                    </div>
                                </div>
                                <div className="card-body">
                                    <h2>{stats.totalUsers.toLocaleString()}</h2>
                                    <h3>Total Users</h3>
                                    <p className="card-subtext">Active registered accounts</p>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="card-top">
                                    <div className="card-icon-container purple-theme">
                                        <Building2 size={18} />
                                    </div>
                                </div>
                                <div className="card-body">
                                    <h2>{stats.totalBuilders.toLocaleString()}</h2>
                                    <h3>Total Builders</h3>
                                    <p className="card-subtext">Registered builder profiles</p>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="card-top">
                                    <div className="card-icon-container green-theme">
                                        <Coins size={18} />
                                    </div>
                                </div>
                                <div className="card-body">
                                    <h2>{stats.totalProperties.toLocaleString()}</h2>
                                    <h3>Total Properties Listed</h3>
                                    <p className="card-subtext">Live real estate listings</p>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="card-top">
                                    <div className="card-icon-container orange-theme">
                                        <Key size={18} />
                                    </div>
                                </div>
                                <div className="card-body">
                                    <h2>{stats.pendingBuilders.toLocaleString()}</h2>
                                    <h3>Pending Builders</h3>
                                    <p className="card-subtext">Awaiting verification approval</p>
                                </div>
                            </div>
                        </div>

                        {/* Chart Grid */}
                        <div className="dashboard-charts">
                            <div className="chart-card">
                                <h3>Listing Mix</h3>
                                <p>By type — {stats.totalProperties.toLocaleString()} total</p>

                                <div className="donut-chart">
                                    <ResponsiveContainer width="100%" height={220}>
                                        <PieChart>
                                            <Pie
                                                data={listingData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={65}
                                                outerRadius={90}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {listingData.map((entry, index) => (
                                                    <Cell
                                                        key={index}
                                                        fill={COLORS[index % COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="chart-legend">
                                    {listingData.map((item, index) => (
                                        <div className="legend-item" key={item.name}>
                                            <span
                                                className="dot"
                                                style={{
                                                    background: COLORS[index % COLORS.length]
                                                }}
                                            ></span>
                                            <span className="legend-name">{item.name}</span>
                                            <b className="legend-value">{item.value}%</b>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="under-construction-container">
                        <div className="construction-content">
                            <div className="construction-icon-wrapper">
                                <Cpu className="construction-icon animate-pulse" size={48} />
                            </div>
                            <h2>{tabNames[activeTab]}</h2>
                            <p>This console section is currently under development. Advanced tools and moderation operations will be integrated here shortly.</p>
                            <button className="back-btn" onClick={() => setActiveTab("overview")}>
                                Return to Platform Overview
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;