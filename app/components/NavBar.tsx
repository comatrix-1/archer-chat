import { Link, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { FaUserCircle, FaSignOutAlt, FaSignInAlt } from "react-icons/fa";

const navItems = [
  { to: "/chats", label: "Chats" },
  { to: "/profile", label: "Profile" },
  { to: "/charts", label: "Charts" },
];

export function NavBar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <nav className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-500 to-blue-400 shadow sticky top-0 z-10 text-white">
      <Link to="/" className="text-2xl font-bold tracking-tight mr-6 hover:text-yellow-300 transition-colors">ArcherChat</Link>
      <div className="flex gap-2 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`px-3 py-1 rounded hover:bg-blue-600 transition-colors ${
              location.pathname.startsWith(item.to) ? "bg-blue-700 font-semibold" : ""
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="flex items-center gap-2 px-2 py-1 bg-white/10 rounded text-white">
              <FaUserCircle className="inline text-xl" />
              <span className="hidden sm:inline">{user.name}</span>
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-1 px-3 py-1 rounded bg-red-500 hover:bg-red-600 transition-colors text-white"
              title="Logout"
            >
              <FaSignOutAlt /> <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-1 px-3 py-1 rounded bg-green-500 hover:bg-green-600 transition-colors text-white"
          >
            <FaSignInAlt /> <span className="hidden sm:inline">Login</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
