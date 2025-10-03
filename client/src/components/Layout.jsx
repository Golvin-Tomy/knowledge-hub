import { Link, useNavigate } from "react-router-dom";

function Layout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div>
      <nav style={{ marginBottom: "20px" }}>
        <Link to="/dashboard">Dashboard</Link> |{" "}
        <Link to="/upload">Upload</Link> |{" "}
        <Link to="/search">Search</Link> |{" "}
        <Link to="/qa">Q&A</Link> |{" "}
        <button onClick={handleLogout} style={{ cursor: "pointer" }}>
          Logout
        </button>
      </nav>
      <main>{children}</main>
    </div>
  );
}

export default Layout;


