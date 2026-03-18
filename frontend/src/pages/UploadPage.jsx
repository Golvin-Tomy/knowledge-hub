import React, { useEffect, useState } from "react";
import {
  createDoc,
  getDocs,
  updateDoc,
  deleteDoc,
} from "../services/DocService";
import DocList from "../components/DocList";
import { PlusCircle, Save, Edit3 } from "lucide-react";

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
    const tagsArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

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
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Title */}
      <h2 className="text-3xl font-bold text-green-700 mb-6 text-center">
        {editId ? "Edit Document" : "Upload New Document"}
      </h2>

      {/* Upload Form */}
      <form
        onSubmit={handleSave}
        className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-md space-y-4"
      >
        <input
          type="text"
          placeholder="Document Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />

        <textarea
          placeholder="Document Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded-md h-32 resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />

        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <button
          type="submit"
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-full transition w-full"
        >
          {editId ? <Save size={18} /> : <PlusCircle size={18} />}
          {editId ? "Update Document" : "Add Document"}
        </button>
      </form>

      {/* Document List */}
      {/* <div className="max-w-4xl mx-auto mt-10">
        <h3 className="text-2xl font-semibold text-gray-700 mb-4 text-center">
          Your Documents
        </h3>
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <DocList docs={docs} onEdit={handleEdit} onDelete={handleDelete} />
        </div>
      </div> */}
    </div>
  );
}



