import { useState } from "react";
import {
  Bell,
  ChevronDown,
  Menu,
  Package,
  Search,
  UserRound,
  LogOut,
  X,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "./UI";

const navGroups = [
  {
    label: null,
    items: [
      ["Dashboard", "/", "layout"],
      ["Products", "/products", "package"],
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      ["Receipts", "/receipts", "receipt"],
      ["Delivery Orders", "/delivery-orders", "truck"],
      ["Inventory Adjustment", "/adjustments", "adjust"],
      ["Move History", "/move-history", "history"],
    ],
  },
  {
    label: "SETTINGS",
    items: [["Warehouse Settings", "/warehouse", "warehouse"]],
  },
];

export function Brand({ compact = false }) {
  return (
    <div className="brand">
      <div className="mark">
        <Package size={compact ? 20 : 31} strokeWidth={1.7} />
      </div>
      <div>
        <div className={compact ? "brand-name compact" : "brand-name"}>
          StockSense
        </div>
        <div className="brand-sub">Inventory operations</div>
      </div>
    </div>
  );
}

function pageTitle(path) {
  if (path === "/") return "Dashboard";
  return path
    .slice(1)
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export function AppShell({ children }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <aside className={open ? "sidebar open" : "sidebar"}>
        <div className="sidebar-top">
          <Brand compact />
          <button className="mobile-close" onClick={() => setOpen(false)}>
            <X size={18} />
          </button>
        </div>
        <nav className="workspace-nav">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label || "main"}>
              {group.label && <div className="nav-label">{group.label}</div>}
              {group.items.map(([label, path, type]) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    isActive ? "nav-item active" : "nav-item"
                  }
                >
                  <Icon type={type} />
                  <span>{label}</span>
                  {label === "Dashboard" && location.pathname === "/" && <i />}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="profile-menu">
          <div className="profile-head">
            <div className="avatar">MC</div>
            <div>
              <strong>Maya Chen</strong>
              <small>Inventory Manager</small>
            </div>
            <ChevronDown size={14} />
          </div>
          <div className="profile-divider" />
          <button onClick={() => navigate("/profile")}>
            <UserRound size={14} />
            My Profile
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("stocksense_token");
              navigate("/login");
            }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>
      <main className="app-main">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="crumb">
            <span>Northstar Commerce</span>
            <b>/</b>
            <strong>{pageTitle(location.pathname)}</strong>
          </div>
          <div className="top-actions">
            <div className="search-box">
              <Search size={15} />
              <input placeholder="Search anything..." />
            </div>
            <button className="icon-button">
              <Bell size={17} />
              <em />
            </button>
            <div className="top-avatar">MC</div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
