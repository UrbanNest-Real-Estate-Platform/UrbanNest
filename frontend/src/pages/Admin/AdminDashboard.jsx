import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer
} from "recharts";

import {
    LayoutDashboard,
    ShieldCheck,
    LogOut,
    Search,
    Bell,
    Users,
    Building2,
    Coins,
    Key,
    MapPin,
    Check,
    X,
    IndianRupee,
    AlertCircle,
    HardHat,
    Trash2,
    Mail,
    Phone,
    FileText,
    UserCheck,
    UserX,
    SlidersHorizontal
} from "lucide-react";

import { 
    getDashboardStats, 
    getPendingBuilders, 
    verifyBuilder, 
    rejectBuilder,
    getAllUsers,
    getAllBuilders,
    deleteUser,
    deleteBuilder
} from "../../services/adminService";

import "./AdminDashboard.css";

const AdminDashboard = () => {
    const [selectedAdminDoc, setSelectedAdminDoc] = useState(null);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalBuilders: 0,
        totalProperties: 0,
        pendingBuilders: 0,
        totalPropertyValue: 0,
        listingMix: []
    });

    const formatCurrency = (amount) => {
        if (!amount || amount === 0) return "₹0";
        if (amount >= 10000000) {
            return `₹${(amount / 10000000).toFixed(2)} Cr`;
        } else if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(2)} Lakh`;
        } else {
            return `₹${amount.toLocaleString("en-IN")}`;
        }
    };

    const listingData = stats.listingMix;

    const COLORS = [
        "#2563eb",
        "#06b6d4",
        "#8b5cf6"
    ];

    const [time, setTime] = useState(new Date());
    const [activeTab, setActiveTab] = useState("overview");

    const [pendingBuildersList, setPendingBuildersList] = useState([]);
    const [loadingLists, setLoadingLists] = useState(false);

    // User & Builder Management States
    const [allUsersList, setAllUsersList] = useState([]);
    const [allBuildersList, setAllBuildersList] = useState([]);
    const [managementFilter, setManagementFilter] = useState("all"); // "all" | "user" | "builder"
    const [searchQuery, setSearchQuery] = useState("");
    const [loadingManagement, setLoadingManagement] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchStats = async () => {
        try {
            const res = await getDashboardStats();
            setStats(res.data.stats);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchVerificationLists = async () => {
        setLoadingLists(true);
        try {
            const buildersRes = await getPendingBuilders();
            setPendingBuildersList(buildersRes.data.builders || []);
        } catch (error) {
            console.error("Error fetching verification lists:", error);
            toast.error("Failed to load verification lists");
        } finally {
            setLoadingLists(false);
        }
    };

    useEffect(() => {
        if (activeTab === "verification") {
            fetchVerificationLists();
        }
    }, [activeTab]);

    const fetchManagementData = async () => {
        setLoadingManagement(true);
        try {
            const [usersRes, buildersRes] = await Promise.all([
                getAllUsers(),
                getAllBuilders()
            ]);
            setAllUsersList(usersRes.data.users || []);
            setAllBuildersList(buildersRes.data.builders || []);
        } catch (error) {
            console.error("Error fetching management data:", error);
            toast.error("Failed to load user and builder accounts");
        } finally {
            setLoadingManagement(false);
        }
    };

    useEffect(() => {
        if (activeTab === "management") {
            fetchManagementData();
        }
    }, [activeTab]);

    const handleVerifyBuilder = async (id) => {
        try {
            const res = await verifyBuilder(id);
            toast.success(res.data.message || "Builder verified successfully");
            setPendingBuildersList(prev => prev.filter(b => b._id !== id));
            setAllBuildersList(prev => prev.map(b => b._id === id ? { ...b, isVerified: true } : b));
            setStats(prev => ({
                ...prev,
                pendingBuilders: Math.max(0, prev.pendingBuilders - 1),
                totalBuilders: prev.totalBuilders + 1
            }));
        } catch (error) {
            console.error("Error verifying builder:", error);
            toast.error(error.response?.data?.message || "Failed to verify builder");
        }
    };

    const handleRejectBuilder = async (id) => {
        try {
            const res = await rejectBuilder(id);
            toast.success(res.data.message || "Builder rejected successfully");
            setPendingBuildersList(prev => prev.filter(b => b._id !== id));
            setAllBuildersList(prev => prev.filter(b => b._id !== id));
            setStats(prev => ({
                ...prev,
                pendingBuilders: Math.max(0, prev.pendingBuilders - 1)
            }));
        } catch (error) {
            console.error("Error rejecting builder:", error);
            toast.error(error.response?.data?.message || "Failed to reject builder");
        }
    };

    const handleDeleteUserAccount = async (userId, name) => {
        if (!window.confirm(`Are you sure you want to delete user account "${name}"?`)) return;
        try {
            await deleteUser(userId);
            toast.success(`User "${name}" deleted successfully`);
            setAllUsersList(prev => prev.filter(u => u._id !== userId));
            fetchStats();
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error(error.response?.data?.message || "Failed to delete user");
        }
    };

    const handleDeleteBuilderAccount = async (builderId, companyName) => {
        if (!window.confirm(`Are you sure you want to delete builder account "${companyName}"?`)) return;
        try {
            await deleteBuilder(builderId);
            toast.success(`Builder "${companyName}" deleted successfully`);
            setAllBuildersList(prev => prev.filter(b => b._id !== builderId));
            setPendingBuildersList(prev => prev.filter(b => b._id !== builderId));
            fetchStats();
        } catch (error) {
            console.error("Error deleting builder:", error);
            toast.error(error.response?.data?.message || "Failed to delete builder");
        }
    };

    const getFilteredAccounts = () => {
        let accounts = [];
        
        if (managementFilter === "all" || managementFilter === "user") {
            accounts.push(...allUsersList.map(u => ({ ...u, accountType: "user" })));
        }
        if (managementFilter === "all" || managementFilter === "builder") {
            accounts.push(...allBuildersList.map(b => ({ ...b, accountType: "builder" })));
        }

        if (!searchQuery.trim()) return accounts;

        const q = searchQuery.toLowerCase().trim();
        return accounts.filter(acc => {
            if (acc.accountType === "user") {
                return (
                    (acc.name && acc.name.toLowerCase().includes(q)) ||
                    (acc.email && acc.email.toLowerCase().includes(q)) ||
                    (acc.phoneNumber && acc.phoneNumber.includes(q)) ||
                    (acc.cityOfResidence && acc.cityOfResidence.toLowerCase().includes(q))
                );
            } else {
                return (
                    (acc.companyName && acc.companyName.toLowerCase().includes(q)) ||
                    (acc.registrationNumber && acc.registrationNumber.toLowerCase().includes(q)) ||
                    (acc.ownerName && acc.ownerName.toLowerCase().includes(q)) ||
                    (acc.email && acc.email.toLowerCase().includes(q)) ||
                    (acc.phoneNumber && acc.phoneNumber.includes(q)) ||
                    (acc.officeAddress && acc.officeAddress.toLowerCase().includes(q))
                );
            }
        });
    };

    const getBuilderCity = (regNo) => {
        if (!regNo) return "Mumbai";
        const prefix = regNo.substring(0, 2).toUpperCase();
        if (prefix === "MH") return "Mumbai";
        if (prefix === "KA") return "Bangalore";
        if (prefix === "DL") return "Delhi";
        return "Mumbai";
    };

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

    const tabNames = {
        overview: "Platform Overview",
        verification: "User & Builder Verification",
        management: "User & Builder Management"
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
                        <span className="badge badge-blue">
                            {stats.pendingBuilders || 0}
                        </span>
                    </button>

                    <button 
                        className={`nav-item ${activeTab === "management" ? "active" : ""}`}
                        onClick={() => setActiveTab("management")}
                    >
                        <Users size={18} />
                        <span>User & Builder Management</span>
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
                        <h1>{tabNames[activeTab]}</h1>
                        <p className="calendar-date">{formatDate(time)}</p>
                    </div>
                    
                    <div className="header-controls">
                        <div className="search-bar">
                            <Search size={16} className="search-icon" />
                            <input 
                                type="text" 
                                placeholder="Search platform..." 
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    if (activeTab !== "management") {
                                        setActiveTab("management");
                                    }
                                }}
                            />
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
                            <div className="stat-card" onClick={() => setActiveTab("management")}>
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

                            <div className="stat-card" onClick={() => setActiveTab("management")}>
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

                            <div className="stat-card" onClick={() => setActiveTab("verification")}>
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

                            <div className="stat-card">
                                <div className="card-top">
                                    <div className="card-icon-container cyan-theme">
                                        <IndianRupee size={18} />
                                    </div>
                                </div>
                                <div className="card-body">
                                    <h2>{formatCurrency(stats.totalPropertyValue || 0)}</h2>
                                    <h3>Total Listed Value</h3>
                                    <p className="card-subtext">Cumulative property valuation</p>
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
                ) : activeTab === "verification" ? (
                    <div className="verification-dashboard-flow">
                        {/* Verification List Card */}
                        <div className="verification-card-container">
                            {loadingLists ? (
                                <div className="loader-container">
                                    <ShieldCheck className="animate-pulse" size={32} />
                                    <p>Loading lists...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="card-header-bar">
                                        <h2>Pending Builder Applications</h2>
                                        <span className="header-count">
                                            {pendingBuildersList.length} {pendingBuildersList.length === 1 ? "application" : "applications"}
                                        </span>
                                    </div>
                                    
                                    <div className="applications-list">
                                        {pendingBuildersList.length === 0 ? (
                                            <div className="empty-state">No pending builder applications</div>
                                        ) : (
                                            pendingBuildersList.map(builder => {
                                                const hasDocs = (builder.documents && builder.documents.length > 0) || (builder.projects && builder.projects.length > 0);
                                                const docsCount = builder.documents ? builder.documents.length : (builder.projects ? builder.projects.length : 0);
                                                return (
                                                <div className="application-item" key={builder._id}>
                                                    <div className="app-icon-box">
                                                        <HardHat className="app-icon" size={20} />
                                                    </div>
                                                    <div className="app-details">
                                                        <div className="app-title-row">
                                                            <h3>{builder.companyName}</h3>
                                                            {!hasDocs && (
                                                                <span className="status-badge-inline red-theme">Missing Docs</span>
                                                            )}
                                                        </div>
                                                        <p className="app-meta">RERA: {builder.registrationNumber} • Owner: {builder.ownerName || "N/A"}</p>
                                                        
                                                        <div className="app-info-row">
                                                            <span className="info-item">
                                                                <MapPin size={12} className="meta-icon" /> {getBuilderCity(builder.registrationNumber)}
                                                            </span>
                                                            <span className="info-item">
                                                                {builder.projects ? builder.projects.length : 0} projects
                                                            </span>
                                                            <span className="info-item">
                                                                {docsCount} documents submitted
                                                            </span>
                                                        </div>

                                                        {/* Document verification list */}
                                                        {builder.documents && builder.documents.length > 0 ? (
                                                            <div className="admin-builder-docs-list">
                                                                <div className="admin-docs-header">Submitted Verification Documents:</div>
                                                                <div className="admin-docs-grid">
                                                                    {builder.documents.map((doc, dIdx) => (
                                                                        <div className="admin-doc-pill" key={dIdx} onClick={() => setSelectedAdminDoc({ ...doc, builderName: builder.companyName, reraNo: builder.registrationNumber })}>
                                                                            <FileText size={14} className="doc-icon-blue" />
                                                                            <div className="admin-doc-pill-info">
                                                                                <span className="doc-pill-title">{doc.title}</span>
                                                                                <span className="doc-pill-category">{doc.category || "RERA Approval"}</span>
                                                                            </div>
                                                                            <div className="admin-doc-pill-right">
                                                                                <span className={`doc-pill-status ${doc.status === 'Verified' ? 'verified' : 'review'}`}>
                                                                                    {doc.status || "Under Review"}
                                                                                </span>
                                                                                <button className="doc-pill-view-btn">Inspect</button>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="app-status-row">
                                                                {builder.projects && builder.projects.length > 0 ? (
                                                                    <span className="doc-status success-text">
                                                                        <Check size={14} className="doc-icon" /> RERA Certificate verified via project registry
                                                                    </span>
                                                                ) : (
                                                                    <span className="doc-status error-text">
                                                                        <AlertCircle size={14} className="doc-icon" /> No legal documents submitted yet
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="app-actions">
                                                        <button className="verify-action-btn" onClick={() => handleVerifyBuilder(builder._id)}>
                                                            <Check size={14} /> Verify Builder
                                                        </button>
                                                        <button className="reject-action-btn" onClick={() => handleRejectBuilder(builder._id)}>
                                                            <X size={14} /> Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                            })
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    /* User & Builder Management Tab */
                    <div className="management-dashboard-flow">
                        <div className="management-controls-bar">
                            <div className="mgmt-search-box">
                                <Search size={16} className="mgmt-search-icon" />
                                <input 
                                    type="text" 
                                    placeholder="Search users by name, email, phone, city or builders by company, RERA..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button className="clear-search-btn" onClick={() => setSearchQuery("")}>
                                        <X size={14} />
                                    </button>
                                )}
                            </div>

                            <div className="mgmt-filter-pills">
                                <button 
                                    className={`filter-pill ${managementFilter === "all" ? "active" : ""}`}
                                    onClick={() => setManagementFilter("all")}
                                >
                                    All Accounts ({allUsersList.length + allBuildersList.length})
                                </button>
                                <button 
                                    className={`filter-pill ${managementFilter === "user" ? "active" : ""}`}
                                    onClick={() => setManagementFilter("user")}
                                >
                                    <Users size={14} /> Users ({allUsersList.length})
                                </button>
                                <button 
                                    className={`filter-pill ${managementFilter === "builder" ? "active" : ""}`}
                                    onClick={() => setManagementFilter("builder")}
                                >
                                    <HardHat size={14} /> Builders ({allBuildersList.length})
                                </button>
                            </div>
                        </div>

                        <div className="management-card-container">
                            {loadingManagement ? (
                                <div className="loader-container">
                                    <Users className="animate-pulse" size={32} />
                                    <p>Loading accounts registry...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="card-header-bar">
                                        <h2>User & Builder Accounts Directory</h2>
                                        <span className="header-count">
                                            Showing {getFilteredAccounts().length} accounts
                                        </span>
                                    </div>

                                    <div className="mgmt-accounts-list">
                                        {getFilteredAccounts().length === 0 ? (
                                            <div className="empty-state">No matching user or builder accounts found.</div>
                                        ) : (
                                            getFilteredAccounts().map(acc => (
                                                <div className={`mgmt-account-item ${acc.accountType}`} key={acc._id}>
                                                    <div className={`mgmt-avatar-box ${acc.accountType === "builder" ? "orange-bg" : "blue-bg"}`}>
                                                        {acc.accountType === "builder" ? (
                                                            <HardHat size={20} />
                                                        ) : (
                                                            <Users size={20} />
                                                        )}
                                                    </div>

                                                    <div className="mgmt-account-details">
                                                        <div className="mgmt-title-row">
                                                            <h3>{acc.accountType === "builder" ? acc.companyName : acc.name}</h3>
                                                            <span className={`role-tag ${acc.accountType}`}>
                                                                {acc.accountType === "builder" ? "BUILDER" : "USER"}
                                                            </span>
                                                            {acc.accountType === "builder" && (
                                                                <span className={`status-badge-inline ${acc.isVerified ? "green-theme" : "orange-theme"}`}>
                                                                    {acc.isVerified ? "Verified" : "Pending Verification"}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <p className="mgmt-subtext">
                                                            {acc.accountType === "builder" ? (
                                                                `RERA: ${acc.registrationNumber} • Owner: ${acc.ownerName}`
                                                            ) : (
                                                                `Registered User • Residence: ${acc.cityOfResidence || "India"}`
                                                            )}
                                                        </p>

                                                        <div className="mgmt-contact-grid">
                                                            <span className="mgmt-info-chip">
                                                                <Mail size={12} className="meta-icon" /> {acc.email}
                                                            </span>
                                                            <span className="mgmt-info-chip">
                                                                <Phone size={12} className="meta-icon" /> {acc.phoneNumber}
                                                            </span>
                                                            {acc.accountType === "builder" && acc.officeAddress && (
                                                                <span className="mgmt-info-chip">
                                                                    <MapPin size={12} className="meta-icon" /> {acc.officeAddress}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="mgmt-account-actions">
                            {/* Action buttons removed – verification and deletion are handled in the Verification tab */}

                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Admin Document Verification Inspection Modal */}
            {selectedAdminDoc && (
                <div className="admin-modal-overlay" onClick={() => setSelectedAdminDoc(null)}>
                    <div className="admin-modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <div className="modal-header-left">
                                <FileText size={20} className="modal-doc-icon" />
                                <div>
                                    <h3>{selectedAdminDoc.title}</h3>
                                    <p>Applicant: <strong>{selectedAdminDoc.builderName}</strong> • RERA: <code>{selectedAdminDoc.reraNo}</code></p>
                                </div>
                            </div>
                            <button className="admin-modal-close" onClick={() => setSelectedAdminDoc(null)}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="admin-modal-body">
                            <div className="doc-meta-bar">
                                <div>
                                    <span className="meta-label">Category:</span>
                                    <span className="meta-val">{selectedAdminDoc.category}</span>
                                </div>
                                <div>
                                    <span className="meta-label">Associated Project:</span>
                                    <span className="meta-val">{selectedAdminDoc.project || "Master Corporate Registration"}</span>
                                </div>
                                <div>
                                    <span className="meta-label">Status:</span>
                                    <span className={`status-badge-inline ${selectedAdminDoc.status === 'Verified' ? 'green-theme' : 'orange-theme'}`}>
                                        {selectedAdminDoc.status || "Under Review"}
                                    </span>
                                </div>
                            </div>

                            <div className="admin-pdf-preview-box">
                                <div className="pdf-paper">
                                    <div className="pdf-header-seal">
                                        <div>
                                            <h2>OFFICIAL STATE RERA REGISTRATION AUTHORITY</h2>
                                            <p>Legal Verification & Compliance Certificate</p>
                                        </div>
                                        <div className="seal-badge">OFFICIAL VERIFIED</div>
                                    </div>
                                    <div className="pdf-body-content">
                                        <p><strong>Document Name:</strong> {selectedAdminDoc.title}</p>
                                        <p><strong>Issuing Entity:</strong> {selectedAdminDoc.builderName}</p>
                                        <p><strong>Registration Ref:</strong> {selectedAdminDoc.reraNo}</p>
                                        <p><strong>Verification Category:</strong> {selectedAdminDoc.category}</p>
                                        <hr className="pdf-hr" />
                                        <h4>Legal Certification Notice</h4>
                                        <p>
                                            This official document certifies that <strong>{selectedAdminDoc.builderName}</strong> has deposited all required architectural site layouts, environmental clearances, and RERA compliance disclosures for verification by UrbanNest Platform Administrators.
                                        </p>
                                        <div className="pdf-signature-area">
                                            <div>
                                                <span>State Competent Authority</span>
                                                <p>UrbanNest Admin Office</p>
                                            </div>
                                            <div className="digital-hash">
                                                <span>Digital Signature Hash</span>
                                                <code>SHA256:7a8f9b0c1d2e3f4a</code>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;