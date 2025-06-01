import { FaSignOutAlt, FaSpinner, FaUserCircle } from "react-icons/fa";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { useAuth } from "../contexts/AuthContext";

export function NavBar() {
  const { user, logout, loading } = useAuth();
  console.log("NavBar auth state:", { user, loading });

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between gap-4 p-4 shadow z-50">
      <Link
        to="/"
        className="text-2xl font-bold tracking-tight mr-6 hover:text-yellow-300 transition-colors"
      >
        ArcherChat
      </Link>
      <div className="flex items-center gap-3">
        {loading && (
          <Button disabled>
            <FaSpinner className="animate-spin" />
          </Button>
        )}
        {!loading && user && (
          <>
            <span className="flex items-center gap-2 px-2 py-1 bg-white/10 rounded text-white">
              <FaUserCircle className="inline text-xl" />
              <span className="hidden sm:inline">{user.name}</span>
            </span>
            <Button onClick={logout} title="Logout">
              <FaSignOutAlt /> <span className="hidden sm:inline">Logout</span>
            </Button>
          </>
        )}
        {!loading && !user && (
          <>
            <Button variant="ghost">
              <Link
                to="/login"
                className="flex items-center gap-1 rounded transition-colors"
              >
                <span className="hidden sm:inline">Login</span>
              </Link>
            </Button>
            <Button>
              <Link
                to="/login"
              >
                <span className="hidden sm:inline">Get Started</span>
              </Link>
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}
