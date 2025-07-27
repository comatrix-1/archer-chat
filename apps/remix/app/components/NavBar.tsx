import { FaSignOutAlt, FaSpinner, FaUserCircle, FaChevronDown } from "react-icons/fa";
import { Link } from "react-router";
import { Button } from "@project/remix/app/components/ui/button";
import { useAuth } from "../contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@project/remix/app/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@project/remix/app/components/ui/avatar";

export function NavBar() {
  const { user, logout, loading } = useAuth();
  console.log("NavBar auth state:", { user, loading });

  return (
    <nav className="sticky top-0 z-50 transition-all duration-300 bg-background/80 backdrop-blur-xl border-b border-border/60">
      <div className="mx-auto px-6 lg:px-8 py-3 flex items-center justify-between h-16">
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL ?? ''} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline-flex items-center gap-1">
                    {user.email}
                    <FaChevronDown className="h-3 w-3 opacity-50" />
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="w-full cursor-pointer">
                    <FaUserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-600 focus:bg-red-50 focus:text-red-600"
                >
                  <FaSignOutAlt className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
      </div>
    </nav>
  );
}
