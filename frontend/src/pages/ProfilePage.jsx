import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Mail, FileText, Users, Edit, Check,
  X, Loader2, Shield, Calendar, ChevronRight,
  UserMinus, Heart
} from "lucide-react";
import API from "../api";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [groups, setGroups] = useState([]);
  const [docCount, setDocCount] = useState(0);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unfollowLoading, setUnfollowLoading] = useState({});

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [meRes, groupsRes, docsRes, followingRes] = await Promise.all([
        API.get("/auth/me"),
        API.get("/groups"),
        API.get("/docs"),
        API.get("/users/me/following"),
      ]);
      setProfile(meRes.data);
      setGroups(groupsRes.data);
      setDocCount(docsRes.data.length);
      setFollowing(followingRes.data);
      setForm({ name: meRes.data.name, email: meRes.data.email });
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      return setEditError("Name and email are required");
    }
    try {
      setSaving(true);
      setEditError("");
      await API.put(`/users/${profile.id}`, form);
      const updated = { ...storedUser, name: form.name, email: form.email };
      localStorage.setItem("user", JSON.stringify(updated));
      setProfile((prev) => ({ ...prev, name: form.name, email: form.email }));
      setEditing(false);
      setEditSuccess(true);
      setTimeout(() => setEditSuccess(false), 3000);
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      setUnfollowLoading((prev) => ({ ...prev, [userId]: true }));
      await API.post(`/users/${userId}/unfollow`);
      // Remove from list instantly
      setFollowing((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to unfollow");
    } finally {
      setUnfollowLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditError("");
    setForm({ name: profile.name, email: profile.email });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-green-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <User className="text-green-600" size={24} />
            My Profile
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your account details</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Profile Card  */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0">
              <span className="text-white font-bold text-2xl">
                {profile?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-800 truncate">{profile?.name}</h2>
              <p className="text-gray-500 text-sm truncate">{profile?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                  profile?.role === "admin"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-green-100 text-green-700"
                }`}>
                  <Shield size={10} />
                  {profile?.role === "admin" ? "Admin" : "Member"}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar size={10} />
                  Joined {new Date(profile?.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 border border-gray-300 text-gray-600 hover:border-green-500 hover:text-green-600 px-3 py-2 rounded-lg text-sm font-medium transition flex-shrink-0"
              >
                <Edit size={14} /> Edit
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              {editError && (
                <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{editError}</p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={cancelEdit}
                  className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg hover:bg-gray-50 transition font-medium flex items-center justify-center gap-2"
                >
                  <X size={15} /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg transition font-medium flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-700">
                <User size={16} className="text-gray-400 flex-shrink-0" />
                <span className="text-sm">{profile?.name}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Mail size={16} className="text-gray-400 flex-shrink-0" />
                <span className="text-sm">{profile?.email}</span>
              </div>
            </div>
          )}

          {editSuccess && (
            <div className="mt-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2 rounded-lg">
              <Check size={15} /> Profile updated successfully!
            </div>
          )}
        </div>

        {/* Stats Row  */}
        <div className="grid grid-cols-3 gap-4">
          <div
            onClick={() => navigate("/my-docs")}
            className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 flex items-center gap-3 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{docCount}</p>
              <p className="text-xs text-gray-500">My Notes</p>
            </div>
          </div>

          <div
            onClick={() => navigate("/groups")}
            className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 flex items-center gap-3 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{groups.length}</p>
              <p className="text-xs text-gray-500">Groups</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 flex items-center gap-3">
            <div className="w-11 h-11 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Heart className="text-pink-500" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{following.length}</p>
              <p className="text-xs text-gray-500">Following</p>
            </div>
          </div>
        </div>

        {/* Following List */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Heart size={18} className="text-pink-500" />
            Following
            <span className="text-sm font-normal text-gray-400 ml-1">
              ({following.length})
            </span>
          </h3>

          {following.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="text-gray-300" size={22} />
              </div>
              <p className="text-gray-500 text-sm font-medium">
                You're not following anyone yet
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Follow people from the dashboard feed to see their posts
              </p>
              <button
                onClick={() => navigate("/dashboard")}
                className="mt-4 text-sm text-green-600 hover:text-green-700 font-medium border border-green-200 hover:border-green-400 px-4 py-2 rounded-lg transition"
              >
                Go to Feed
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {following.map((person) => {
                const personName = person.name || person.email;
                return (
                  <div
                    key={person._id}
                    className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">
                          {personName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          {personName}
                        </p>
                        <p className="text-xs text-gray-400">{person.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnfollow(person._id)}
                      disabled={unfollowLoading[person._id]}
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-gray-300 text-gray-500 hover:border-red-300 hover:text-red-500 transition disabled:opacity-60"
                    >
                      {unfollowLoading[person._id]
                        ? <Loader2 size={12} className="animate-spin" />
                        : <UserMinus size={12} />}
                      Unfollow
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/*  My Groups List  */}
        {groups.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users size={18} className="text-green-600" />
              My Groups
            </h3>
            <div className="space-y-2">
              {groups.map((group) => {
                const isOwner =
                  group.owner?._id === profile?.id ||
                  group.owner === profile?.id;
                return (
                  <div
                    key={group._id}
                    onClick={() => navigate(`/groups/${group._id}`)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">
                          {group.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{group.name}</p>
                        <p className="text-xs text-gray-400">
                          {group.members?.length} member{group.members?.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isOwner && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          Owner
                        </span>
                      )}
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}