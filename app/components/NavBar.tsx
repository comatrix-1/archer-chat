import { Link, useLocation } from "react-router";

const navItems = [
  { to: "/chats", label: "Chats" },
  { to: "/profile", label: "Profile" },
  { to: "/charts", label: "Charts" },
];

export function NavBar() {
  const location = useLocation();
  return (
    <nav className="flex gap-4 p-4 bg-white shadow sticky top-0 z-10">
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`px-3 py-1 rounded hover:bg-gray-100 transition-colors ${
            location.pathname.startsWith(item.to) ? "bg-gray-200 font-semibold" : ""
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
