import React, { useEffect, useState } from "react";
import {
  createDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  searchDoc,
} from "../services/DocService";
import { getMe } from "../services/AuthService";

const Dashboard = () => {
  const [docs, setDocs] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchUser();
    fetchDocs();
  }, []);

  const fetchUser = async () => {
    try {
      const data = await getMe();
      setUser(data);
    } catch (err) {
      console.error("Error fetching user", err);
    }
  };

  const fetchDocs = async () => {
    try {
      const data = await getDocs();
      setDocs(data);
    } catch (err) {
      alert("Error fetching docs");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("Title and content cannot be empty");
      return;
    }

    try {
      const tagsArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      if (editId) {
        await updateDoc(editId, { title, content, tags: tagsArray });
        setEditId(null);
      } else {
        await createDoc({ title, content, tags: tagsArray });
      }

      setTitle("");
      setContent("");
      setTags("");
      fetchDocs();
    } catch (err) {
      alert(editId ? "Error updating doc" : "Error creating doc");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(id);
      fetchDocs();
    } catch (err) {
      alert("Error deleting doc");
    }
  };

  const handleEdit = (doc) => {
    setEditId(doc._id);
    setTitle(doc.title);
    setContent(doc.content);
    setTags(doc.tags?.join(", ") || "");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleSearch = async () => {
    if (!search.trim()) {
      fetchDocs();
      return;
    }
    try {
      const results = await searchDoc(search);
      setDocs(results);
    } catch (err) {
      alert("Error searching docs");
    }
  };

  return (
    <div>
      <h2>Dashboard</h2>

      {user && (
        <div className="text-center">
          <p>
            Welcome, <b>{user.name}</b> ({user.role})
          </p>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white py-2 px-4 rounded mt-4"
          >
            Logout
          </button>
        </div>
      )}

      {/* Search Section */}
      <div style={{ marginTop: "20px" }}>
        <input
          type="text"
          placeholder="Search docs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* Add / Edit Form */}
      <form onSubmit={handleSave} style={{ marginTop: "20px" }}>
        <input
          type="text"
          placeholder="Doc title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <br />
        <textarea
          placeholder="Doc content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <br />
        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <br />
        <button type="submit">{editId ? "Update Doc" : "Add Doc"}</button>
      </form>

      {/* Docs List */}
      <h3>Your Documents</h3>
      <ul>
        {docs.map((doc) => (
          <li key={doc._id}>
            <strong>{doc.title}</strong> - {doc.content.substring(0, 50)}...
            <br />
            {doc.tags && doc.tags.length > 0 && (
              <small>Tags: {doc.tags.join(", ")}</small>
            )}
            <br />
            <button onClick={() => handleDelete(doc._id)}>Delete</button>
            <button onClick={() => handleEdit(doc)}>Edit</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
