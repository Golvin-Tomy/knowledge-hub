import React, { useEffect, useState } from "react";
import axios from "axios";
import { getDocs } from "../services/DocService";
import { Search, X, FileText, Edit, Trash2 } from "lucide-react";

export default function SearchPage() {
  const [allDocs, setAllDocs] = useState([]);
  const [docs, setDocs] = useState([]);
  const [query, setQuery] = useState("");
  const [semanticQuery, setSemanticQuery] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [editingDocId, setEditingDocId] = useState(null);
  const [form, setForm] = useState({ title: "", content: "" });

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user")); // Current user

  useEffect(() => {
    const fetchAllDocs = async () => {
      try {
        const data = await getDocs();
        setAllDocs(data);
        setDocs(data);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch documents.");
      }
    };
    fetchAllDocs();
  }, []);

  const handleSearch = () => {
    if (!query.trim()) return;
    const results = allDocs.filter(
      (doc) =>
        doc.title.toLowerCase().includes(query.toLowerCase()) ||
        doc.content.toLowerCase().includes(query.toLowerCase())
    );
    setDocs(results);
  };

  const handleSemanticSearch = async () => {
    if (!semanticQuery.trim()) return;
    try {
      const res = await axios.post(
        "http://localhost:5000/api/docs/semantic-search",
        { query: semanticQuery },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDocs(res.data);
    } catch (err) {
      console.error(err);
      alert("Semantic search failed.");
    }
  };

  const handleEdit = (doc) => {
    setEditingDocId(doc._id);
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
      setAllDocs(allDocs.map((d) => (d._id === id ? data : d)));
      setEditingDocId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update document.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/docs/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocs(docs.filter((d) => d._id !== id));
      setAllDocs(allDocs.filter((d) => d._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete document.");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-green-700 mb-8 text-center">
        Search Documents
      </h2>

      {/* Search Inputs */}
      <div className="max-w-3xl mx-auto grid gap-6">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Regular search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleSearch}
            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-lg transition"
          >
            <Search size={16} /> Search
          </button>
        </div>

        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Semantic search..."
            value={semanticQuery}
            onChange={(e) => setSemanticQuery(e.target.value)}
            className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleSemanticSearch}
            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-lg transition"
          >
            <Search size={16} /> Semantic Search
          </button>
        </div>
      </div>

      {/* Documents */}
      <div className="max-w-5xl mx-auto mt-10">
        <h3 className="text-2xl font-semibold text-gray-700 mb-4 text-center">
          Documents
        </h3>
        <div className="bg-white p-6 rounded-2xl shadow-sm grid gap-4">
          {docs.length === 0 ? (
            <p className="text-gray-500 text-center">No documents found.</p>
          ) : (
            docs.map((doc) => {
              const canEditOrDelete = user.role === "admin" || user._id === doc.createdBy?._id;

              return (
                <div
                  key={doc._id}
                  className="p-5 border border-gray-200 rounded-xl hover:shadow-md transition cursor-pointer"
                >
                  {editingDocId === doc._id ? (
                    <div className="grid gap-3">
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="p-2 border border-gray-300 rounded"
                      />
                      <textarea
                        value={form.content}
                        onChange={(e) => setForm({ ...form, content: e.target.value })}
                        className="p-2 border border-gray-300 rounded h-32"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(doc._id)}
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingDocId(null)}
                          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start gap-4">
                      <div onClick={() => setSelectedDoc(doc)} className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="text-green-600" size={18} />
                          <h4 className="text-lg font-semibold text-gray-800">{doc.title}</h4>
                        </div>
                        <p className="text-gray-600 line-clamp-2">
                          {doc.content?.length > 120
                            ? doc.content.substring(0, 120) + "..."
                            : doc.content}
                        </p>
                      </div>
                      {canEditOrDelete && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(doc)}
                            className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded flex items-center gap-1"
                          >
                            <Edit size={16} /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(doc._id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1"
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedDoc && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
          onClick={(e) => e.target === e.currentTarget && setSelectedDoc(null)}
        >
          <div className="bg-white rounded-2xl shadow-lg max-w-3xl w-full mx-4 p-6 relative overflow-hidden max-h-[80vh]">
            <button
              onClick={() => setSelectedDoc(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={22} />
            </button>
            <h3 className="text-2xl font-bold text-green-700 mb-4">{selectedDoc.title}</h3>
            <div className="overflow-y-auto max-h-[65vh] pr-3 text-gray-700 leading-relaxed scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 whitespace-pre-line">
              {selectedDoc.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


