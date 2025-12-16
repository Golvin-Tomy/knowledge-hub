import { useNavigate } from "react-router-dom";
import { Upload, Search, MessageCircleQuestion, LogOut } from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const features = [
    {
      title: "Upload Documents",
      desc: "Add new knowledge files and organize your data securely.",
      icon: <Upload className="w-8 h-8 text-blue-500" />,
      link: "/upload",
    },
    {
      title: "Search Documents",
      desc: "Find documents instantly using smart keyword and tag search.",
      icon: <Search className="w-8 h-8 text-green-500" />,
      link: "/search",
    },
    {
      title: "Ask AI Questions",
      desc: "Get AI-powered answers based on your stored documents.",
      icon: <MessageCircleQuestion className="w-8 h-8 text-purple-500" />,
      link: "/qa",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome to Your Knowledge Hub
        </h1>
        <p className="text-gray-600 mb-8">
          Manage your documents, search intelligently, and ask AI anything.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {features.map((f, index) => (
            <div
              key={index}
              onClick={() => navigate(f.link)}
              className="cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 text-left border border-gray-100 hover:-translate-y-1"
            >
              <div className="mb-4">{f.icon}</div>
              <h3 className="font-semibold text-gray-800 text-lg mb-1">
                {f.title}
              </h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg shadow-md transition"
        >
          <LogOut className="w-5 h-5" /> Logout
        </button> */}
      </div>
    </div>
  );
}

export default Dashboard;
