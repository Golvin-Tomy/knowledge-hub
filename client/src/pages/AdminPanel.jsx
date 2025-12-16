import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { LogOut, Edit, Trash2, Save, X, Search } from "lucide-react";

function AdminPanel() {
  const [docs, setDocs] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docsRes = await axios.get("http://localhost:5000/api/docs", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const usersRes = await axios.get("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setDocs(docsRes.data);
        setUsers(usersRes.data);
        setFilteredUsers(usersRes.data);
      } catch (err) {
        console.error(err);
        alert("Access denied. Only admins can view this page.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // ✅ Search filter
  useEffect(() => {
    const results = users.filter(
      (u) =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(results);
    setCurrentPage(1); // reset to first page after new search
  }, [searchTerm, users]);

  // ✅ Delete user
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`http://localhost:5000/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(users.filter((u) => u._id !== id));
      } catch (err) {
        console.error(err);
        alert("Failed to delete user.");
      }
    }
  };

  // ✅ Edit / Save / Cancel
  const handleEdit = (user) => {
    setEditingUserId(user._id);
    setEditForm({ name: user.name, email: user.email });
  };

  const handleCancel = () => {
    setEditingUserId(null);
    setEditForm({ name: "", email: "" });
  };

  const handleSave = async (id) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/users/${id}`,
        { name: editForm.name, email: editForm.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(users.map((u) => (u._id === id ? res.data : u)));
      setEditingUserId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update user.");
    }
  };

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // ✅ Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-green-700">Admin Panel</h2>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* User Table */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold text-gray-800">All Users</h3>

          {/* Search Bar */}
          <div className="relative">
            <Search
              size={18}
              className="absolute top-2.5 left-3 text-gray-500"
            />
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-3 py-2 border rounded-md w-64 focus:ring-2 focus:ring-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead className="bg-green-600 text-white">
              <tr>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Role</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map((u) => (
                  <tr
                    key={u._id}
                    className="border-b hover:bg-gray-100 transition"
                  >
                    <td className="py-2 px-4">
                      {editingUserId === u._id ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          className="border rounded-md px-2 py-1 w-full focus:ring-2 focus:ring-green-500"
                        />
                      ) : (
                        u.name
                      )}
                    </td>
                    <td className="py-2 px-4">
                      {editingUserId === u._id ? (
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) =>
                            setEditForm({ ...editForm, email: e.target.value })
                          }
                          className="border rounded-md px-2 py-1 w-full focus:ring-2 focus:ring-green-500"
                        />
                      ) : (
                        u.email
                      )}
                    </td>
                    <td className="py-2 px-4">{u.role}</td>
                    <td className="py-2 px-4 text-center">
                      {editingUserId === u._id ? (
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => handleSave(u._id)}
                            className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 flex items-center gap-1"
                          >
                            <Save size={16} /> Save
                          </button>
                          <button
                            onClick={handleCancel}
                            className="bg-gray-400 text-white px-3 py-1 rounded-md hover:bg-gray-500 flex items-center gap-1"
                          >
                            <X size={16} /> Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => handleEdit(u)}
                            className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 flex items-center gap-1"
                          >
                            <Edit size={16} /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(u._id)}
                            className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 flex items-center gap-1"
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-6 gap-3">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-700 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(p + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Documents Section */}
      <div className="mt-10 bg-white p-6 rounded-2xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold text-gray-800">
            All Documents
          </h3>
          <button
            onClick={() => navigate("/admin/docs")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            View Documents
          </button>
        </div>

        <ul className="divide-y divide-gray-200">
          {docs.map((d) => (
            <li key={d._id} className="py-3 text-gray-700">
              <span className="font-medium">{d.title}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AdminPanel;
