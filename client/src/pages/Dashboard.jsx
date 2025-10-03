import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div>
      <h2>Welcome to your Dashboard</h2>
      <p>Select an option above: Upload, Search, or Q&A.</p>
      <button onClick={handleLogout} style={{ marginTop: "10px" }}>
        Logout
      </button>
    </div>
  );
}

export default Dashboard;

