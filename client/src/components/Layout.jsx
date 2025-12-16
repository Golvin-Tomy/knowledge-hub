import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react"; // optional icon

function Layout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Navbar */}
      <nav className="bg-white shadow-md py-4 px-8 flex justify-between items-center">
        {/* Left: Brand Name */}
        <Link
          to="/dashboard"
          className="text-2xl font-bold text-green-700 italic hover:text-green-800 transition-colors"
        >
          KnowledgeHub
        </Link>

        {/* Center: Navigation Links */}
        <div className="flex gap-6 text-gray-600 font-medium">
          <Link to="/dashboard" className="hover:text-green-600 transition">
            Dashboard
          </Link>
          <Link to="/upload" className="hover:text-green-600 transition">
            Upload
          </Link>
          <Link to="/search" className="hover:text-green-600 transition">
            My Docs
          </Link>
          <Link to="/qa" className="hover:text-green-600 transition">
            Q&A
          </Link>
        </div>

        {/* Right: Logout Button */}
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



