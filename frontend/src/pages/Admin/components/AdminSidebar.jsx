import { NavLink } from "react-router-dom";

import {
    LayoutDashboard,
    Users,
    Building2,
    Building,
    FileCheck,
    BarChart3,
    IndianRupee,
    BrainCircuit,
    ScrollText,
    LogOut
} from "lucide-react";

import logo from "../../../assets/icons/logo.jpg";

import "./AdminSidebar.css";

function AdminSidebar() {

    const menuItems = [
        {
            title: "Dashboard",
            icon: <LayoutDashboard size={20} />,
            path: "/admin/dashboard"
        },
        {
            title: "Users",
            icon: <Users size={20} />,
            path: "/admin/users"
        },
        {
            title: "Builders",
            icon: <Building2 size={20} />,
            path: "/admin/builders"
        },
        {
            title: "Properties",
            icon: <Building size={20} />,
            path: "/admin/properties"
        },
        {
            title: "Transfers",
            icon: <FileCheck size={20} />,
            path: "/admin/transfers"
        },
        {
            title: "Analytics",
            icon: <BarChart3 size={20} />,
            path: "/admin/analytics"
        },
        {
            title: "Revenue",
            icon: <IndianRupee size={20} />,
            path: "/admin/revenue"
        },
        {
            title: "ML Health",
            icon: <BrainCircuit size={20} />,
            path: "/admin/ml-health"
        },
        {
            title: "System Logs",
            icon: <ScrollText size={20} />,
            path: "/admin/logs"
        }
    ];

    return (

        <aside className="admin-sidebar">

            <div className="admin-logo">

                <img
                    src={logo}
                    alt="UrbanNest"
                />

                <h2>
                    Urban<span>Nest</span>
                </h2>

            </div>

            <nav>

                {
                    menuItems.map((item) => (

                        <NavLink
                            key={item.title}
                            to={item.path}
                            className={({ isActive }) =>
                                isActive
                                    ? "sidebar-link active"
                                    : "sidebar-link"
                            }
                        >

                            {item.icon}

                            <span>{item.title}</span>

                        </NavLink>

                    ))
                }

            </nav>

            <button className="logout-btn">

                <LogOut size={20} />

                Logout

            </button>

        </aside>

    );
}

export default AdminSidebar;