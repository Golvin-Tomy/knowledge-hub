import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, Users } from "lucide-react";

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navLinks = [
    { to: "/dashboard", label: "Home" },
    { to: "/my-docs", label: "My Docs" },
    { to: "/groups", label: "Groups" },
    { to: "/profile", label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Navbar */}
      <nav className="bg-white shadow-md py-4 px-8 flex justify-between items-center">
        {/* Left: Brand */}
        <Link
          to="/dashboard"
          className="text-2xl font-bold text-green-700 italic hover:text-green-800 transition-colors"
        >
          KnowledgeHub
        </Link>

        {/* Center: Nav Links */}
        <div className="flex gap-6 text-gray-600 font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`hover:text-green-600 transition flex items-center gap-1 ${
                location.pathname.startsWith(link.to)
                  ? "text-green-600 font-semibold border-b-2 border-green-600 pb-0.5"
                  : ""
              }`}
            >
              {link.label === "Groups" && <Users size={15} />}
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right: Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 bg-red-600 hover:bg-green-700 text-white px-4 py-2 rounded-full transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </nav>

      {/* Page Content */}
      <main className="p-8">{children}</main>
    </div>
  );
}

export default Layout;
