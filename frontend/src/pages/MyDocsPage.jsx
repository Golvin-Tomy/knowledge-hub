import { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Search,
  Sparkles,
  Edit,
  Trash2,
  X,
  Loader2,
  Tag,
  Clock,
  Eye,
  Lock,
  Globe,
} from "lucide-react";
import API from "../api";

const TABS = [
  { key: "all", label: "All Notes" },
  { key: "search", label: "Keyword Search" },
  { key: "semantic", label: "Smart Search" },
];

export default function MyDocsPage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // Add / Edit modal
  const [showModal, setShowModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null); // null = adding new
  const [form, setForm] = useState({ title: "", content: "", isPublic: false });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // View modal
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Keyword search
  const [keyword, setKeyword] = useState("");
  const [keywordResults, setKeywordResults] = useState([]);
  const [keywordLoading, setKeywordLoading] = useState(false);
  const [keywordDone, setKeywordDone] = useState(false);

  // Semantic search
  const [semanticQuery, setSemanticQuery] = useState("");
  const [semanticResults, setSemanticResults] = useState([]);
  const [semanticLoading, setSemanticLoading] = useState(false);
  const [semanticDone, setSemanticDone] = useState(false);

  // Delete
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/docs");
      setDocs(data);
    } catch (err) {
      console.error("Failed to fetch docs:", err);
    } finally {
      setLoading(false);
    }
  };

  // open add
  const openAdd = () => {
    setEditingDoc(null);
    setForm({ title: "", content: "", isPublic: false });
    setFormError("");
    setShowModal(true);
  };

  // open edit
  const openEdit = (doc, e) => {
    e.stopPropagation();
    setEditingDoc(doc);
    setForm({ title: doc.title, content: doc.content, isPublic: doc.isPublic });
    setFormError("");
    setShowModal(true);
  };

  // submit add or edit
  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      return setFormError("Title and content are required");
    }
    try {
      setSubmitting(true);
      setFormError("");

      if (editingDoc) {
        // Edit
        const { data } = await API.put(`/docs/${editingDoc._id}`, form);
        setDocs((prev) =>
          prev.map((d) => (d._id === editingDoc._id ? data : d)),
        );
      } else {
        // Add new
        const { data } = await API.post("/docs", {
          ...form,
          groupId: null,
        });
        setDocs((prev) => [data, ...prev]);
      }

      setShowModal(false);
      setForm({ title: "", content: "", isPublic: false });
      setEditingDoc(null);
    } catch (err) {
      setFormError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  // delete
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this note permanently?")) return;
    try {
      setDeletingId(id);
      await API.delete(`/docs/${id}`);
      setDocs((prev) => prev.filter((d) => d._id !== id));
      if (selectedDoc?._id === id) setSelectedDoc(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete note");
    } finally {
      setDeletingId(null);
    }
  };

  // Keyword search
  const handleKeywordSearch = async () => {
    if (!keyword.trim()) return;
    try {
      setKeywordLoading(true);
      setKeywordDone(false);
      const { data } = await API.get(
        `/docs/search?q=${encodeURIComponent(keyword)}`,
      );
      setKeywordResults(data);
      setKeywordDone(true);
    } catch (err) {
      console.error("Keyword search failed:", err);
    } finally {
      setKeywordLoading(false);
    }
  };

  // Semantic search
  const handleSemanticSearch = async () => {
    if (!semanticQuery.trim()) return;
    try {
      setSemanticLoading(true);
      setSemanticDone(false);
      const { data } = await API.post("/docs/semantic-search", {
        query: semanticQuery,
      });
      setSemanticResults(data);
      setSemanticDone(true);
    } catch (err) {
      console.error("Semantic search failed:", err);
    } finally {
      setSemanticLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col sm:flex-row gap-3 sm:gap-0 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="text-green-600" size={24} />
              My Notes
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Your personal knowledge — {docs.length} note
              {docs.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center justify-center gap-2 w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            <Plus size={16} /> Add Note
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-4xl mx-auto px-4 pb-3">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === key
                    ? "bg-white text-green-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/*all notes */}
        {activeTab === "all" && (
          <>
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-green-600" size={36} />
              </div>
            ) : docs.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                <FileText className="mx-auto text-gray-300 mb-3" size={52} />
                <h3 className="text-lg font-semibold text-gray-600 mb-1">
                  No notes yet
                </h3>
                <p className="text-gray-400 text-sm mb-5">
                  Start building your personal knowledge base.
                </p>
                <button
                  onClick={openAdd}
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium transition"
                >
                  Add Your First Note
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {docs.map((doc) => (
                  <DocCard
                    key={doc._id}
                    doc={doc}
                    onView={() => setSelectedDoc(doc)}
                    onEdit={(e) => openEdit(doc, e)}
                    onDelete={(e) => handleDelete(doc._id, e)}
                    deleting={deletingId === doc._id}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* keyword tab */}
        {activeTab === "search" && (
          <div>
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 sm:p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
                <Search className="text-green-600" size={20} />
                Keyword Search
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                Search your personal notes by title, content, or tags.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Search your notes..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleKeywordSearch()}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleKeywordSearch}
                  disabled={keywordLoading}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-5 py-3 rounded-lg font-medium transition"
                >
                  {keywordLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Search size={16} />
                  )}
                  Search
                </button>
              </div>
            </div>

            {keywordLoading && (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-green-600" size={32} />
              </div>
            )}

            {keywordDone && keywordResults.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                No notes matched "<span className="font-medium">{keyword}</span>
                ".
              </div>
            )}

            {keywordResults.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {keywordResults.map((doc) => (
                  <DocCard
                    key={doc._id}
                    doc={doc}
                    onView={() => setSelectedDoc(doc)}
                    onEdit={(e) => openEdit(doc, e)}
                    onDelete={(e) => handleDelete(doc._id, e)}
                    deleting={deletingId === doc._id}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* smart search tab */}
        {activeTab === "semantic" && (
          <div>
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 sm:p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
                <Sparkles className="text-green-600" size={20} />
                Smart Search
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                Search by meaning — finds related notes even if the exact words
                don't match.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder='e.g. "how does the water cycle work?"'
                  value={semanticQuery}
                  onChange={(e) => setSemanticQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSemanticSearch()}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleSemanticSearch}
                  disabled={semanticLoading}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-5 py-3 rounded-lg font-medium transition"
                >
                  {semanticLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Sparkles size={16} />
                  )}
                  Search
                </button>
              </div>
            </div>

            {semanticLoading && (
              <div className="flex items-center justify-center gap-3 py-10 text-green-600">
                <Loader2 className="animate-spin" size={24} />
                <span className="font-medium">
                  Finding semantically similar notes...
                </span>
              </div>
            )}

            {semanticDone && semanticResults.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                No similar notes found. Try rephrasing your query or add more
                notes!
              </div>
            )}

            {semanticResults.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {semanticResults.map((doc) => (
                  <DocCard
                    key={doc._id}
                    doc={doc}
                    onView={() => setSelectedDoc(doc)}
                    onEdit={(e) => openEdit(doc, e)}
                    onDelete={(e) => handleDelete(doc._id, e)}
                    deleting={deletingId === doc._id}
                    score={doc.score}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* add,edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-4 sm:p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800">
                {editingDoc ? "Edit Note" : "Add New Note"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Note title..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Write your notes here..."
                  value={form.content}
                  onChange={(e) =>
                    setForm({ ...form, content: e.target.value })
                  }
                  rows={7}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.isPublic}
                  onChange={(e) =>
                    setForm({ ...form, isPublic: e.target.checked })
                  }
                  className="w-4 h-4 accent-green-600"
                />
                <span className="text-sm text-gray-600">
                  Make this note public (visible on the dashboard feed)
                </span>
              </label>

              {formError && (
                <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">
                  {formError}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg transition font-medium flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  {submitting
                    ? editingDoc
                      ? "Saving..."
                      : "Adding..."
                    : editingDoc
                      ? "Save Changes"
                      : "Add Note"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* view doc */}
      {selectedDoc && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4"
          onClick={(e) => e.target === e.currentTarget && setSelectedDoc(null)}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-4 sm:p-6 relative max-h-[85vh] flex flex-col">
            <button
              onClick={() => setSelectedDoc(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-2xl font-bold text-gray-800 pr-8 flex-1">
                {selectedDoc.title}
              </h3>
              {selectedDoc.isPublic ? (
                <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  <Globe size={11} /> Public
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  <Lock size={11} /> Private
                </span>
              )}
            </div>

            <p className="text-xs text-gray-400 mb-4 flex items-center gap-1">
              <Clock size={11} />
              {new Date(selectedDoc.createdAt).toLocaleString()}
            </p>

            {selectedDoc.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedDoc.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-green-100 text-green-700 px-3 py-0.5 rounded-full text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {selectedDoc.summary && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                <p className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">
                  AI Summary
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {selectedDoc.summary}
                </p>
              </div>
            )}

            <div className="overflow-y-auto flex-1 pr-2 text-gray-700 leading-relaxed whitespace-pre-line scrollbar-thin scrollbar-thumb-gray-300">
              {selectedDoc.content}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={(e) => {
                  setSelectedDoc(null);
                  openEdit(selectedDoc, e);
                }}
                className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                <Edit size={14} /> Edit
              </button>
              <button
                onClick={(e) => {
                  handleDelete(selectedDoc._id, e);
                }}
                className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* doc card*/
function DocCard({ doc, onView, onEdit, onDelete, deleting, score }) {
  return (
    <div
      onClick={onView}
      className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 hover:shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer flex flex-col gap-3"
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-gray-800 text-base line-clamp-2 flex-1">
          {doc.title}
        </h3>
        <div className="flex items-center gap-1 flex-shrink-0">
          {score !== undefined && (
            <span className="text-xs bg-green-50 border border-green-200 text-green-700 font-semibold px-2 py-0.5 rounded-lg">
              {Math.round(score * 100)}%
            </span>
          )}
          {doc.isPublic ? (
            <span title="Public" className="text-blue-400">
              <Globe size={14} />
            </span>
          ) : (
            <span title="Private" className="text-gray-300">
              <Lock size={14} />
            </span>
          )}
        </div>
      </div>

      {/* Summary / content */}
      <p className="text-gray-500 text-sm line-clamp-2 flex-1">
        {doc.summary || doc.content?.slice(0, 130)}
      </p>

      {/* Tags */}
      {doc.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {doc.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs flex items-center gap-1"
            >
              <Tag size={9} />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <Clock size={11} />
          {new Date(doc.createdAt).toLocaleDateString()}
        </span>
        <div className="flex flex-col sm:flex-row gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onEdit}
            className="flex items-center gap-1 bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-lg text-xs font-medium transition"
          >
            <Edit size={12} /> Edit
          </button>
          <button
            onClick={onDelete}
            disabled={deleting}
            className="flex items-center gap-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white px-3 py-1 rounded-lg text-xs font-medium transition"
          >
            {deleting ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Trash2 size={12} />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
