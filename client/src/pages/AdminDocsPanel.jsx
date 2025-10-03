import React, { useEffect, useState } from "react";
import axios from "axios";

function AdminDocsPanel() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDoc, setEditingDoc] = useState(null);
  const [form, setForm] = useState({ title: "", content: "" });

  const token = localStorage.getItem("token"); // ✅ grab token

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/docs/admin/all",
          {
            headers: { Authorization: `Bearer ${token}` }, // ✅ send token
          }
        );
        setDocs(data);
      } catch (err) {
        console.error("Error fetching docs:", err);
        alert("Failed to load documents. Only admins can view.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, [token]);

  const handleEdit = (doc) => {
    setEditingDoc(doc._id);
    setForm({ title: doc.title, content: doc.content });
  };

  const handleSave = async (id) => {
    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/docs/admin/${id}`,
        form,
        {
          headers: { Authorization: `Bearer ${token}` }, // ✅ send token
        }
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
        headers: { Authorization: `Bearer ${token}` }, // ✅ send token
      });
      setDocs(docs.filter((d) => d._id !== id));
    } catch (err) {
      console.error("Error deleting doc:", err);
      alert("Failed to delete document");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container mt-4">
  <h2>Admin Documents Panel</h2>
  <ul className="list-group">
    {docs.map((d) => (
      <li key={d._id} className="list-group-item">
        {editingDoc === d._id ? (
          <div>
            <input
              type="text"
              className="form-control mb-2"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <textarea
              className="form-control mb-2"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
            <button
              className="btn btn-success btn-sm me-2"
              onClick={() => handleSave(d._id)}
            >
              Save
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setEditingDoc(null)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>{d.title}</strong>
              <p className="mb-0">{d.content}</p>
              <small className="text-muted">
                Owner: {d.createdBy?.username} ({d.createdBy?.email})
              </small>
            </div>
            <div>
              <button
                className="btn btn-warning btn-sm me-2"
                onClick={() => handleEdit(d)}
              >
                Edit
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDelete(d._id)}
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </li>
    ))}
  </ul>
</div>

  );
}

export default AdminDocsPanel;


