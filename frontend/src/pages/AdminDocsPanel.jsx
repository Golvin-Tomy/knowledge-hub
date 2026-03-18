import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  Search,
  Edit,
  Trash2,
  Save,
  X,
  BookOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function AdminDocsPanel() {
  const [docs, setDocs] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDoc, setEditingDoc] = useState(null);
  const [form, setForm] = useState({ title: "", content: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null); // For modal

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/docs/admin/all",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setDocs(data);
        setFilteredDocs(data);
      } catch (err) {
        console.error("Error fetching docs:", err);
        alert("Failed to load documents. Only admins can view.");
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, [token]);

  // 🔍 Search filter
  useEffect(() => {
    const results = docs.filter(
      (doc) =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDocs(results);
  }, [searchTerm, docs]);

  const handleEdit = (doc) => {
    setEditingDoc(doc._id);
    setForm({ title: doc.title, content: doc.content });
  };

  const handleSave = async (id) => {
    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/docs/admin/${id}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDocs(docs.map((d) => (d._id === id ? data : d)));
      setEditingDoc(null);
    } catch (err) {
      console.error("Error updating doc:", err);
      alert("Failed to update document");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?"))
      return;
    try {
      await axios.delete(`http://localhost:5000/api/docs/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocs(docs.filter((d) => d._id !== id));
    } catch (err) {
      console.error("Error deleting doc:", err);
      alert("Failed to delete document");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/admin")}
          className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold">Go Back</span>
        </button>

        <h2 className="text-3xl font-bold text-gray-800 text-center flex-1">
          Admin Documents Panel
        </h2>
      </div>

      {/* Search Bar */}
      <div className="flex items-center max-w-lg mx-auto mb-6 bg-white shadow-sm rounded-xl p-2">
        <Search className="text-gray-400 ml-2" size={20} />
        <input
          type="text"
          placeholder="Search documents..."
          className="flex-1 p-2 outline-none text-gray-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Documents List */}
      <div className="max-w-5xl mx-auto space-y-4">
        {filteredDocs.length === 0 ? (
          <p className="text-center text-gray-500">No documents found.</p>
        ) : (
          filteredDocs.map((d) => (
            <div
              key={d._id}
              className="bg-white rounded-2xl shadow-md p-5 hover:shadow-lg transition"
            >
              {editingDoc === d._id ? (
                <div>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg mb-3 focus:ring-2 focus:ring-green-500 outline-none"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                  />
                  <textarea
                    className="w-full p-2 border rounded-lg mb-3 focus:ring-2 focus:ring-green-500 outline-none"
                    rows={4}
                    value={form.content}
                    onChange={(e) =>
                      setForm({ ...form, content: e.target.value })
                    }
                  />
                  <div className="flex gap-2">
                    <button
                      className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
                      onClick={() => handleSave(d._id)}
                    >
                      <Save size={18} /> Save
                    </button>
                    <button
                      className="flex items-center gap-1 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition"
                      onClick={() => setEditingDoc(null)}
                    >
                      <X size={18} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {d.title}
                  </h3>
                  <p className="text-gray-600 mb-3 whitespace-pre-line">
                    {d.content.length > 150
                      ? d.content.slice(0, 150) + "..."
                      : d.content}
                  </p>
                  {d.content.length > 150 && (
                    <button
                      onClick={() => setSelectedDoc(d)}
                      className="text-green-600 text-sm font-medium hover:underline flex items-center gap-1"
                    >
                      <BookOpen size={16} /> Read More
                    </button>
                  )}
                  <p className="text-sm text-gray-500 mt-3">
                    Owner:{" "}
                    <span className="font-medium">
                      {d.createdBy?.username}
                    </span>{" "}
                    ({d.createdBy?.email})
                  </p>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleEdit(d)}
                      className="flex items-center gap-1 bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-2 rounded-lg transition"
                    >
                      <Edit size={16} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(d._id)}
                      className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 📄 Scrollable Modal for Full Content */}
      {selectedDoc && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-lg p-6 relative max-h-[80vh] overflow-y-auto">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedDoc(null)}
            >
              <X size={22} />
            </button>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">
              {selectedDoc.title}
            </h3>
            <p className="text-gray-700 whitespace-pre-line mb-4">
              {selectedDoc.content}
            </p>
            <p className="text-sm text-gray-500">
              Owner:{" "}
              <span className="font-medium">
                {selectedDoc.createdBy?.username}
              </span>{" "}
              ({selectedDoc.createdBy?.email})
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDocsPanel;
