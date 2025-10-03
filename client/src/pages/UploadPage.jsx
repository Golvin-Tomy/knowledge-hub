import React, { useEffect, useState } from "react";
import { createDoc, getDocs, updateDoc, deleteDoc } from "../services/DocService";
import DocList from "../components/DocList";

export default function UploadPage() {
  const [docs, setDocs] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchDocs();
  }, []);

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
    const tagsArray = tags.split(",").map((t) => t.trim()).filter(Boolean);

    try {
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

  const handleEdit = (doc) => {
    setEditId(doc._id);
    setTitle(doc.title);
    setContent(doc.content);
    setTags(doc.tags?.join(", ") || "");
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(id);
      fetchDocs();
    } catch (err) {
      alert("Error deleting doc");
    }
  };

  return (
    <div>
      <h2>Upload / Edit Document</h2>
      <form onSubmit={handleSave}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <br />
        <textarea
          placeholder="Content"
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

      <h3>Your Documents</h3>
      <DocList docs={docs} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}



