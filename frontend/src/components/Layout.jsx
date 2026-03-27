import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, Users } from "lucide-react";
import { useState } from "react";

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

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
      <nav className="bg-white shadow-md py-4 px-4 md:px-8 flex justify-between items-center">
        
        {/* Brand */}
        <Link
          to="/dashboard"
          className="text-xl md:text-2xl font-bold text-green-700 italic"
        >
          KnowledgeHub
        </Link>

        {/* Hamburger Button (Mobile only) */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        {/* Nav Links */}
        <div
          className={`
            absolute md:static top-16 left-0 w-full md:w-auto bg-white md:bg-transparent
            flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-0
            transition-all duration-300
            ${menuOpen ? "block" : "hidden md:flex"}
          `}
        >
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`hover:text-green-600 transition flex items-center gap-1 ${
                location.pathname.startsWith(link.to)
                  ? "text-green-600 font-semibold"
                  : ""
              }`}
            >
              {link.label === "Groups" && <Users size={15} />}
              {link.label}
            </Link>
          ))}

          {/* Logout inside mobile menu */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded-full md:hidden"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        {/* Desktop Logout */}
        <button
          onClick={handleLogout}
          className="hidden md:flex items-center gap-1 bg-red-600 hover:bg-green-700 text-white px-4 py-2 rounded-full transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </nav>

      {/* Page Content */}
      <main className="p-4 md:p-8">{children}</main>
    </div>
  );
}

export default Layout;
