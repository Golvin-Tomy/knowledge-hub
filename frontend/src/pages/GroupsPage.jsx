import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  LogIn,
  Copy,
  Check,
  ChevronRight,
  Loader2,
  X,
} from "lucide-react";
import API from "../api";

export default function GroupsPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", description: "" });
  const [inviteCode, setInviteCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [error, setError] = useState("");

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/groups");
      setGroups(data);
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreate = async () => {
    if (!createForm.name.trim()) return setError("Group name is required");
    try {
      setSubmitting(true);
      setError("");
      const { data } = await API.post("/groups", createForm);
      setGroups((prev) => [data, ...prev]);
      setShowCreateModal(false);
      setCreateForm({ name: "", description: "" });
      navigate(`/groups/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create group");
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) return setError("Enter an invite code");
    try {
      setSubmitting(true);
      setError("");
      const { data } = await API.post("/groups/join", {
        inviteCode: inviteCode.trim().toUpperCase(),
      });
      setShowJoinModal(false);
      setInviteCode("");
      navigate(`/groups/${data.group._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid invite code");
    } finally {
      setSubmitting(false);
    }
  };

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const closeCreate = () => {
    setShowCreateModal(false);
    setCreateForm({ name: "", description: "" });
    setError("");
  };

  const closeJoin = () => {
    setShowJoinModal(false);
    setInviteCode("");
    setError("");
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Users className="text-green-600" size={24} />
              My Groups
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Collaborate and share notes with your classmates
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowJoinModal(true);
                setError("");
              }}
              className="flex items-center gap-2 border border-green-600 text-green-600 hover:bg-green-50 px-4 py-2 rounded-lg font-medium transition"
            >
              <LogIn size={16} /> Join Group
            </button>
            <button
              onClick={() => {
                setShowCreateModal(true);
                setError("");
              }}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              <Plus size={16} /> Create Group
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-green-600" size={36} />
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-green-600" size={36} />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No groups yet
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Create a group for your class or join one with an invite code from
              your classmates.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowJoinModal(true)}
                className="border border-green-600 text-green-600 hover:bg-green-50 px-5 py-2 rounded-lg font-medium transition"
              >
                Join with Code
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium transition"
              >
                Create a Group
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {groups.map((group) => {
              const isOwner =
                group.owner?._id === user.id || group.owner === user.id;
              return (
                <div
                  key={group._id}
                  className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer"
                  onClick={() => navigate(`/groups/${group._id}`)}
                >
                  {/* Group pic and name */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-lg">
                          {group.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg leading-tight">
                          {group.name}
                        </h3>
                        {isOwner && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                            Owner
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="text-gray-400" size={20} />
                  </div>

                  {/* Description */}
                  {group.description && (
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                      {group.description}
                    </p>
                  )}

                  {/* Members count */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {group.members?.length || 0} member
                      {group.members?.length !== 1 ? "s" : ""}
                    </span>
                    <span>
                      {new Date(group.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Invite Code  */}
                  <div
                    className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">
                        Invite Code
                      </p>
                      <p className="font-mono font-bold text-gray-700 tracking-widest text-sm">
                        {group.inviteCode}
                      </p>
                    </div>
                    <button
                      onClick={() => copyCode(group.inviteCode, group._id)}
                      className="text-gray-400 hover:text-green-600 transition p-1"
                      title="Copy invite code"
                    >
                      {copiedId === group._id ? (
                        <Check size={16} className="text-green-600" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800">
                Create a Group
              </h2>
              <button
                onClick={closeCreate}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Class 10 - Physics"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  placeholder="What is this group for?"
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={closeCreate}
                  className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={submitting}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg transition font-medium flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  Create Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800">Join a Group</h2>
              <button
                onClick={closeJoin}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-gray-500 text-sm mb-4">
              Ask your classmate or teacher for the group's invite code.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invite Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. A3F9K2LM"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-mono tracking-widest text-center text-lg uppercase"
                  maxLength={8}
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={closeJoin}
                  className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoin}
                  disabled={submitting}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg transition font-medium flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  Join Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
