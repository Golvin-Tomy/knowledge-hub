import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Users, ArrowLeft, Plus, Search, FileText, X, Loader2,
  Send, Copy, Check, Bot, BookOpen, Sparkles, Edit,
} from "lucide-react";
import API from "../api";

const TABS = [
  { key: "notes", label: "Notes", icon: BookOpen },
  { key: "search", label: "Smart Search", icon: Sparkles },
  { key: "ask", label: "Ask AI", icon: Bot },
];

export default function GroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [group, setGroup] = useState(null);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("notes");

  const [showEditGroup, setShowEditGroup] = useState(false);
  const [editGroupForm, setEditGroupForm] = useState({ name: "", description: "" });
  const [editGroupSaving, setEditGroupSaving] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [copied, setCopied] = useState(false);

  const [showAddNote, setShowAddNote] = useState(false);
  const [noteForm, setNoteForm] = useState({ title: "", content: "", isPublic: false });
  const [addingNote, setAddingNote] = useState(false);
  const [noteError, setNoteError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchDone, setSearchDone] = useState(false);

  const [question, setQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState(null);
  const [aiSources, setAiSources] = useState([]);
  const [askingAI, setAskingAI] = useState(false);

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => { fetchGroupData(); }, [id]);

  const fetchGroupData = async () => {
    try {
      setLoading(true);
      const [groupRes, docsRes] = await Promise.all([
        API.get(`/groups/${id}`),
        API.get(`/groups/${id}/docs`),
      ]);
      setGroup(groupRes.data);
      setDocs(docsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(group.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditGroup = async () => {
    if (!editGroupForm.name.trim()) return;
    try {
      setEditGroupSaving(true);
      const { data } = await API.put(`/groups/${id}`, editGroupForm);
      setGroup(data);
      setShowEditGroup(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update group");
    } finally {
      setEditGroupSaving(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Remove this member from the group?")) return;
    try {
      await API.delete(`/groups/${id}/members/${memberId}`);
      setGroup((prev) => ({
        ...prev,
        members: prev.members.filter((m) => m._id !== memberId),
      }));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove member");
    }
  };

  const handleAddNote = async () => {
    if (!noteForm.title.trim() || !noteForm.content.trim()) {
      return setNoteError("Title and content are required");
    }
    try {
      setAddingNote(true);
      setNoteError("");
      const { data } = await API.post("/docs", { ...noteForm, groupId: id });
      setDocs((prev) => [data, ...prev]);
      setShowAddNote(false);
      setNoteForm({ title: "", content: "", isPublic: false });
    } catch (err) {
      setNoteError(err.response?.data?.message || "Failed");
    } finally {
      setAddingNote(false);
    }
  };

  const handleSemanticSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      setSearching(true);
      setSearchDone(false);
      const { data } = await API.post(`/groups/${id}/semantic-search`, { query: searchQuery });
      setSearchResults(data);
      setSearchDone(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleAskAI = async () => {
    if (!question.trim()) return;
    try {
      setAskingAI(true);
      setAiAnswer(null);
      setAiSources([]);
      const { data } = await API.post(`/groups/${id}/ask`, { question });
      setAiAnswer(data.answer);
      setAiSources(data.sources || []);
    } catch (err) {
      setAiAnswer("Something went wrong. Please try again.");
    } finally {
      setAskingAI(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm("Leave group?")) return;
    try {
      setLeaving(true);
      await API.post(`/groups/${id}/leave`);
      navigate("/groups");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to leave");
      setLeaving(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm("Delete group? This cannot be undone.")) return;
    try {
      await API.delete(`/groups/${id}`);
      navigate("/groups");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  const isOwner = group?.owner?._id === user.id || group?.owner === user.id;

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <Loader2 className="animate-spin text-green-600" size={40} />
    </div>
  );
  if (!group) return <div className="text-center py-20 text-gray-500">Group not found.</div>;

  // ✅ Everything inside ONE return()
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/groups")} className="text-gray-400 hover:text-gray-600 transition">
                <ArrowLeft size={22} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold">{group.name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">{group.name}</h1>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Users size={12} />
                    {group.members?.length} member{group.members?.length !== 1 ? "s" : ""}
                    {group.description && ` · ${group.description}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <button
                onClick={copyInviteCode}
                className="text-xs flex items-center gap-1 text-gray-500 hover:text-green-600 border border-gray-200 hover:border-green-400 px-3 py-1.5 rounded-lg transition"
              >
                {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                {copied ? "Copied!" : group.inviteCode}
              </button>

              <button
                onClick={() => setShowMembers(true)}
                className="text-xs flex items-center gap-1 text-gray-500 hover:text-blue-600 border border-gray-200 hover:border-blue-300 px-3 py-1.5 rounded-lg transition"
              >
                <Users size={13} /> {group.members?.length} Members
              </button>

              {isOwner && (
                <button
                  onClick={() => {
                    setEditGroupForm({ name: group.name, description: group.description || "" });
                    setShowEditGroup(true);
                  }}
                  className="text-xs flex items-center gap-1 text-gray-500 hover:text-yellow-600 border border-gray-200 hover:border-yellow-400 px-3 py-1.5 rounded-lg transition"
                >
                  <Edit size={13} /> Edit
                </button>
              )}

              {isOwner ? (
                <button
                  onClick={handleDeleteGroup}
                  className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition"
                >
                  Delete Group
                </button>
              ) : (
                <button
                  onClick={handleLeaveGroup}
                  disabled={leaving}
                  className="text-xs text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition"
                >
                  {leaving ? "Leaving..." : "Leave Group"}
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === key ? "bg-white text-green-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Notes Tab */}
        {activeTab === "notes" && (
          <div>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold text-gray-700">
                {docs.length} Note{docs.length !== 1 ? "s" : ""} in this group
              </h2>
              <button
                onClick={() => setShowAddNote(true)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                <Plus size={16} /> Add Note
              </button>
            </div>

            {docs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                <FileText className="mx-auto text-gray-300 mb-3" size={48} />
                <p className="text-gray-500 font-medium">No notes yet</p>
                <p className="text-gray-400 text-sm mt-1">Be the first to add a note!</p>
                <button
                  onClick={() => setShowAddNote(true)}
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
                >
                  Add First Note
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {docs.map((doc) => (
                  <NoteCard key={doc._id} doc={doc} currentUser={user} onClick={() => setSelectedDoc(doc)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Smart Search Tab */}
        {activeTab === "search" && (
          <div>
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
                <Sparkles className="text-green-600" size={20} /> Semantic Search
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                Search by meaning — results come from all notes added by group members.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder='Try: "how does photosynthesis work?"'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSemanticSearch()}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleSemanticSearch}
                  disabled={searching}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-5 py-3 rounded-lg font-medium transition"
                >
                  {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                  Search
                </button>
              </div>
            </div>

            {searching && (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-green-600" size={32} />
              </div>
            )}
            {searchDone && searchResults.length === 0 && (
              <div className="text-center py-10 text-gray-500">No matching notes found.</div>
            )}
            {searchResults.length > 0 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 font-medium">
                  {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} found
                </p>
                {searchResults.map((doc) => (
                  <NoteCard key={doc._id} doc={doc} currentUser={user} onClick={() => setSelectedDoc(doc)} score={doc.score} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Ask AI Tab */}
        {activeTab === "ask" && (
          <div>
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
                <Bot className="text-purple-600" size={20} /> Ask AI
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                Ask any question — AI answers using only this group's notes.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={`e.g. "Explain Newton's third law"`}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAskAI()}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleAskAI}
                  disabled={askingAI}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white px-5 py-3 rounded-lg font-medium transition"
                >
                  {askingAI ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Ask
                </button>
              </div>
            </div>

            {askingAI && (
              <div className="flex items-center justify-center gap-3 py-10 text-purple-600">
                <Loader2 className="animate-spin" size={24} />
                <span className="font-medium">AI is thinking from your group's notes...</span>
              </div>
            )}

            {aiAnswer && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl shadow-md border border-purple-100 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Bot size={16} className="text-purple-600" />
                    </div>
                    <span className="font-semibold text-gray-800">AI Answer</span>
                    <span className="text-xs text-gray-400 ml-auto">Based on group notes</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{aiAnswer}</p>
                </div>

                {aiSources.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-2 px-1">
                      📚 Sources used ({aiSources.length})
                    </p>
                    <div className="space-y-2">
                      {aiSources.map((src, i) => (
                        <div key={src._id || i} className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full text-xs font-bold flex items-center justify-center">
                              {i + 1}
                            </span>
                            <span className="text-gray-700 font-medium text-sm">{src.title}</span>
                          </div>
                          {src.createdBy && (
                            <span className="text-xs text-gray-400">
                              by {src.createdBy.name || src.createdBy.email}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Note Modal */}
      {showAddNote && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800">Add Note to Group</h2>
              <button onClick={() => { setShowAddNote(false); setNoteError(""); }} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Note title..."
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content <span className="text-red-500">*</span></label>
                <textarea
                  placeholder="Write your notes here..."
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  rows={6}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={noteForm.isPublic}
                  onChange={(e) => setNoteForm({ ...noteForm, isPublic: e.target.checked })}
                  className="w-4 h-4 accent-green-600"
                />
                <span className="text-sm text-gray-600">Also make this note public</span>
              </label>
              {noteError && (
                <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{noteError}</p>
              )}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => { setShowAddNote(false); setNoteError(""); }}
                  className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNote}
                  disabled={addingNote}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg transition font-medium flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {addingNote && <Loader2 size={16} className="animate-spin" />}
                  {addingNote ? "Adding..." : "Add Note"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/*  View Doc Modal  */}
      {selectedDoc && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4"
          onClick={(e) => e.target === e.currentTarget && setSelectedDoc(null)}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative max-h-[85vh] flex flex-col">
            <button onClick={() => setSelectedDoc(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            <h3 className="text-2xl font-bold text-gray-800 mb-1 pr-8">{selectedDoc.title}</h3>
            {selectedDoc.createdBy && (
              <p className="text-sm text-gray-400 mb-4">
                by {selectedDoc.createdBy.name || selectedDoc.createdBy.email} · {new Date(selectedDoc.createdAt).toLocaleDateString()}
              </p>
            )}
            {selectedDoc.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedDoc.tags.map((tag) => (
                  <span key={tag} className="bg-green-100 text-green-700 px-3 py-0.5 rounded-full text-xs font-medium">#{tag}</span>
                ))}
              </div>
            )}
            {selectedDoc.summary && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                <p className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">AI Summary</p>
                <p className="text-gray-600 text-sm">{selectedDoc.summary}</p>
              </div>
            )}
            <div className="overflow-y-auto flex-1 pr-2 text-gray-700 leading-relaxed whitespace-pre-line">
              {selectedDoc.content}
            </div>
          </div>
        </div>
      )}

      {/*Edit Group Modal  */}
      {showEditGroup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800">Edit Group</h2>
              <button onClick={() => setShowEditGroup(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                <input
                  type="text"
                  value={editGroupForm.name}
                  onChange={(e) => setEditGroupForm({ ...editGroupForm, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editGroupForm.description}
                  onChange={(e) => setEditGroupForm({ ...editGroupForm, description: e.target.value })}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setShowEditGroup(false)}
                  className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditGroup}
                  disabled={editGroupSaving}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg transition font-medium flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {editGroupSaving && <Loader2 size={15} className="animate-spin" />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Members Modal */}
      {showMembers && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Users size={20} className="text-green-600" />
                Members ({group.members?.length})
              </h2>
              <button onClick={() => setShowMembers(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {group.members?.map((member) => {
                const memberName = member.name || member.email;
                const isMemberOwner = member._id === group.owner?._id;
                const isMe = member._id === user.id;
                return (
                  <div key={member._id} className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">{memberName.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {memberName} {isMe && <span className="text-gray-400">(You)</span>}
                        </p>
                        <p className="text-xs text-gray-400">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isMemberOwner && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Owner</span>
                      )}
                      {isOwner && !isMemberOwner && !isMe && (
                        <button
                          onClick={() => handleRemoveMember(member._id)}
                          className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-2 py-1 rounded-lg transition"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div> 
  );
}

/* Note Card  */
function NoteCard({ doc, currentUser, onClick, score }) {
  const authorName = doc.createdBy?.name || doc.createdBy?.email || "Unknown";
  const isMe = doc.createdBy?._id === currentUser.id || doc.createdBy === currentUser.id;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 hover:shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer"
    >
      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">{authorName.charAt(0).toUpperCase()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-700 text-sm truncate">{authorName}</p>
            {isMe && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">You</span>
            )}
          </div>
          <p className="text-xs text-gray-400">{new Date(doc.createdAt).toLocaleString()}</p>
        </div>
        {score !== undefined && (
          <div className="flex-shrink-0 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-2 py-1 rounded-lg">
            {Math.round(score * 100)}% match
          </div>
        )}
      </div>
      <h3 className="font-bold text-gray-800 text-base mb-1 line-clamp-1">{doc.title}</h3>
      <p className="text-gray-500 text-sm line-clamp-2 mb-3">{doc.summary || doc.content?.slice(0, 150)}</p>
      {doc.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {doc.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">#{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}