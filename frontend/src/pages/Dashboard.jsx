import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageCircleQuestion, Eye, Users, UserPlus, UserMinus,
  ChevronDown, Loader2, X, BookOpen
} from "lucide-react";
import API from "../api";

const PAGE_SIZE = 5;

export default function Dashboard() {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [publicDocs, setPublicDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Following
  const [following, setFollowing] = useState(new Set()); // Set of user IDs
  const [followingOnly, setFollowingOnly] = useState(false);
  const [followLoading, setFollowLoading] = useState({}); // { userId: bool }

  // Read more
  const [expandedId, setExpandedId] = useState(null);

  const features = [
    {
      title: "My Notes",
      desc: "Add and manage your personal notes.",
      icon: <BookOpen className="w-8 h-8 text-blue-500" />,
      link: "/my-docs",
    },
    {
      title: "Groups",
      desc: "Collaborate and share notes with classmates.",
      icon: <Users className="w-8 h-8 text-green-500" />,
      link: "/groups",
    },
    {
      title: "Ask AI",
      desc: "Get answers from your notes using AI.",
      icon: <MessageCircleQuestion className="w-8 h-8 text-purple-500" />,
      link: "/qa",
    },
  ];

  // Fetch following list 
  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const { data } = await API.get("/users/me/following");
        setFollowing(new Set(data.map((u) => u._id)));
      } catch (err) {
        console.error("Failed to fetch following:", err);
      }
    };
    fetchFollowing();
  }, []);

  // Fetch docs if page changes
  useEffect(() => {
    fetchDocs(1, false);
  }, []);

  const fetchDocs = async (pageNum, append) => {
    try {
      append ? setLoadingMore(true) : setLoading(true);
      const { data } = await API.get(`/docs/public?page=${pageNum}&limit=${PAGE_SIZE}`);
      const newDocs = data.docs || [];
      setPublicDocs((prev) => append ? [...prev, ...newDocs] : newDocs);
      setHasMore(data.pagination.page < data.pagination.pages);
      setPage(pageNum);
    } catch (err) {
      console.error("Failed to fetch public docs:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    fetchDocs(page + 1, true);
  };

  const handleFollow = async (userId) => {
    try {
      setFollowLoading((prev) => ({ ...prev, [userId]: true }));
      if (following.has(userId)) {
        await API.post(`/users/${userId}/unfollow`);
        setFollowing((prev) => { const s = new Set(prev); s.delete(userId); return s; });
      } else {
        await API.post(`/users/${userId}/follow`);
        setFollowing((prev) => new Set([...prev, userId]));
      }
    } catch (err) {
      console.error("Follow/unfollow failed:", err);
    } finally {
      setFollowLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  // Filter docs if followingOnly mode is on
  const displayedDocs = followingOnly && following.size > 0
    ? publicDocs.filter((doc) => following.has(doc.createdBy?._id))
    : publicDocs;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-lg md:text-2xl font-bold text-gray-800">Knowledge Hub Feed</h1>
        </div>
      </div>

      <div className="max-w-2xl md:max-w-3xl mx-auto px-3 md:px-4 py-6 md:py-8 space-y-6 md:space-y-8">
        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div
              key={i}
              onClick={() => navigate(f.link)}
              className="cursor-pointer bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-4 border border-gray-100 hover:-translate-y-1"
            >
              <div className="mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-800 text-base mb-1">{f.title}</h3>
              <p className="text-gray-500 text-xs">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Feed Header & Following toggle */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-800">Public Knowledge Posts</h2>
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setFollowingOnly(false)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  !followingOnly ? "bg-white text-green-700 shadow-sm" : "text-gray-500"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFollowingOnly(true)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  followingOnly ? "bg-white text-green-700 shadow-sm" : "text-gray-500"
                }`}
              >
                Following
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-blue-500" size={36} />
            </div>
          ) : displayedDocs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-gray-500 font-medium">
                {followingOnly
                  ? "No posts from people you follow yet. Switch to All to discover people!"
                  : "No public posts yet. Be the first to share!"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedDocs.map((doc) => {
                const authorName = doc.createdBy?.name || doc.createdBy?.email || "Unknown";
                const authorId = doc.createdBy?._id;
                const isMe = authorId === storedUser.id;
                const isFollowing = following.has(authorId);
                const isExpanded = expandedId === doc._id;

                return (
                  <div
                    key={doc._id}
                    className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 md:p-6 hover:shadow-xl transition-all"
                  >
                    {/* Author row */}
                    <div className="flex flex-wrap items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-sm">
                          {authorName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{authorName}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(doc.createdAt).toLocaleString()}
                        </p>
                      </div>

                      {/* Follow button — don't show for own posts */}
                      {!isMe && authorId && (
                        <button
                          onClick={() => handleFollow(authorId)}
                          disabled={followLoading[authorId]}
                          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition flex-shrink-0 ${
                            isFollowing
                              ? "border-gray-300 text-gray-500 hover:border-red-300 hover:text-red-500"
                              : "border-green-500 text-green-600 hover:bg-green-50"
                          }`}
                        >
                          {followLoading[authorId] ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : isFollowing ? (
                            <><UserMinus size={12} /> Unfollow</>
                          ) : (
                            <><UserPlus size={12} /> Follow</>
                          )}
                        </button>
                      )}

                      {/* Group badge */}
                      {doc.groupId && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium flex items-center gap-1 flex-shrink-0">
                          <Users size={10} />
                          {doc.groupId?.name || "Group"}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <h3 className="text-base md:text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                      {doc.title}
                    </h3>

                    {/* Expandable content */}
                    <div className={`text-gray-600 mb-3 text-sm leading-relaxed ${!isExpanded ? "line-clamp-3" : ""}`}>
                      {doc.summary || doc.content}
                    </div>

                    {/* Read more / less toggle */}
                    {(doc.summary || doc.content)?.length > 150 && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : doc._id)}
                        className="text-blue-500 hover:text-blue-700 text-xs font-medium mb-3 flex items-center gap-1 transition"
                      >
                        {isExpanded ? (
                          <><X size={12} /> Read less</>
                        ) : (
                          <><ChevronDown size={12} /> Read more</>
                        )}
                      </button>
                    )}

                    {/* Tags */}
                    {doc.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {doc.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Eye className="w-4 h-4" />
                        <span>{doc.views || 0} views</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Load More */}
              {hasMore && !followingOnly && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="flex items-center gap-2 bg-white border px-4 md:px-6 py-2.5 rounded-xl border-gray-300 hover:border-green-500 hover:text-green-600 text-gray-600 px-6 py-2.5 rounded-xl font-medium shadow-sm transition disabled:opacity-60"
                  >
                    {loadingMore ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                    {loadingMore ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}