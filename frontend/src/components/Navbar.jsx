import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? "bg-emerald-50 text-emerald-700"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
    }`;

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold">
              H
            </div>
            <span className="text-lg font-semibold text-slate-900">
              Hishab-AI
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
            <NavLink to="/send" className={navLinkClass}>Send Money</NavLink>
            <NavLink to="/transactions" className={navLinkClass}>Transactions</NavLink>
            <NavLink to="/settings" className={navLinkClass}>Settings</NavLink>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-slate-600">
              {user?.name}
            </span>
            <button
              onClick={handleLogout}
              className="rounded-md bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex gap-1 pb-3 overflow-x-auto">
          <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
          <NavLink to="/send" className={navLinkClass}>Send</NavLink>
          <NavLink to="/transactions" className={navLinkClass}>Transactions</NavLink>
          <NavLink to="/settings" className={navLinkClass}>Settings</NavLink>
        </div>
      </div>
    </nav>
  );
}