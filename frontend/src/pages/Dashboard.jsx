import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Search, MessageCircleQuestion, LogOut, Eye } from "lucide-react";
import API from "../api";

function Dashboard() {
  const navigate = useNavigate();
  const [publicDocs, setPublicDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const fetchPublicDocs = async () => {
      try {
        setLoading(true);
        const { data } = await API.get("/docs/public?page=1");
        setPublicDocs(data.docs);
      } catch (error) {
        console.error("Failed to fetch public docs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicDocs();
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Knowledge Hub Feed
          </h1>
          {/* <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md transition"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button> */}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Quick Features - Smaller */}
        <div className="grid md:grid-cols-3 gap-4">
          {features.map((f, index) => (
            <div
              key={index}
              onClick={() => navigate(f.link)}
              className="cursor-pointer bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-4 text-left border border-gray-100 hover:-translate-y-1"
            >
              <div className="mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-800 text-base mb-1">
                {f.title}
              </h3>
              <p className="text-gray-500 text-xs">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Public Docs Feed - FB/Insta Style */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            Public Knowledge Posts
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : publicDocs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No public documents yet. Be the first to share!
            </div>
          ) : (
            <div className="space-y-4">
              {publicDocs.map((doc) => (
                <div key={doc._id} className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-xl transition-all">
                  {/* Doc Header - User Info + Time */}
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {doc.owner.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {doc.owner.username || doc.owner.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(doc.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Doc Content */}
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                    {doc.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {doc.summary || doc.content?.slice(0, 150)}...
                  </p>

                  {/* Tags */}
                  {doc.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {doc.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Eye className="w-4 h-4" />
                      <span>{doc.views || 0} views</span>
                    </div>
                    <button
                      onClick={() => navigate(`/docs/${doc._id}`)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                      View Post
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
