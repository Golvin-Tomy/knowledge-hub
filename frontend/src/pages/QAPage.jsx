import { useState } from "react";
import {
  Bot,
  Send,
  Loader2,
  FileText,
  Sparkles,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import API from "../api";

const SUGGESTIONS = [
  "Summarize my notes on photosynthesis",
  "What did I write about Newton's laws?",
  "Explain the water cycle from my notes",
  "What are the key points in my history notes?",
];

export default function QAPage() {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedSources, setExpandedSources] = useState({});

  const handleAsk = async (q) => {
    const query = q || question;
    if (!query.trim() || loading) return;

    setLoading(true);
    setQuestion("");

    const newIndex = history.length;
    setHistory((prev) => [
      ...prev,
      { question: query, answer: null, sources: [] },
    ]);

    try {
      const { data } = await API.post("/docs/ask-question", {
        question: query,
      });
      setHistory((prev) =>
        prev.map((item, i) =>
          i === newIndex
            ? { ...item, answer: data.answer, sources: data.sources || [] }
            : item,
        ),
      );
    } catch (err) {
      setHistory((prev) =>
        prev.map((item, i) =>
          i === newIndex
            ? {
                ...item,
                answer: "Something went wrong. Please try again.",
                sources: [],
              }
            : item,
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleSources = (index) => {
    setExpandedSources((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleReset = () => {
    setHistory([]);
    setExpandedSources({});
    setQuestion("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4 py-4 flex flex-col sm:flex-row gap-3 sm:gap-0 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Bot className="text-purple-600" size={24} />
              Ask AI
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Answers generated from your personal notes
            </p>
          </div>
          {history.length > 0 && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 border border-gray-200 hover:border-red-300 px-3 py-2 rounded-lg transition"
            >
              <RotateCcw size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Empty state */}
        {history.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="text-purple-600" size={30} />
            </div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">
              Ask anything from your notes
            </h2>
            <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto">
              AI will search your personal notes and answer based only on what
              you've written.
            </p>

            {/* Suggestion */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 justify-center">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleAsk(s)}
                  className="bg-white border border-gray-200 hover:border-purple-400 hover:text-purple-600 text-gray-600 text-sm px-4 py-2 rounded-full shadow-sm transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat history */}
        {history.map((item, index) => (
          <div key={index} className="space-y-3">
            {/* User question bubble */}
            <div className="flex justify-end">
              <div className="bg-purple-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm max-w-[90%] sm:max-w-[80%] text-sm leading-relaxed shadow-sm">
                {item.question}
              </div>
            </div>

            {/* AI answer bubble */}
            <div className="flex justify-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={16} className="text-purple-600" />
              </div>
              <div className="flex-1 max-w-[100%] sm:max-w-[85%]">
                <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                  {item.answer === null ? (
                    <div className="flex items-center gap-2 text-purple-500 text-sm py-1">
                      <Loader2 size={15} className="animate-spin" />
                      Searching your notes...
                    </div>
                  ) : (
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                      {item.answer}
                    </p>
                  )}
                </div>

                {/* Sources toggle */}
                {item.sources?.length > 0 && (
                  <div className="mt-2">
                    <button
                      onClick={() => toggleSources(index)}
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-purple-600 transition"
                    >
                      <FileText size={12} />
                      {item.sources.length} source note
                      {item.sources.length !== 1 ? "s" : ""} used
                      {expandedSources[index] ? (
                        <ChevronUp size={12} />
                      ) : (
                        <ChevronDown size={12} />
                      )}
                    </button>

                    {expandedSources[index] && (
                      <div className="mt-2 space-y-1.5">
                        {item.sources.map((src, i) => (
                          <div
                            key={src._id || i}
                            className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2"
                          >
                            <span className="w-5 h-5 bg-purple-100 text-purple-700 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0">
                              {i + 1}
                            </span>
                            <span className="text-xs text-gray-600 font-medium truncate">
                              {src.title}
                            </span>
                            {src.score !== undefined && (
                              <span className="ml-auto text-xs text-gray-400 flex-shrink-0">
                                {Math.round(src.score * 100)}% match
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAsk();
                }
              }}
              placeholder="Ask a question from your notes... (Enter to send)"
              rows={1}
              className="w-full sm:flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm"
            />
            <button
              onClick={() => handleAsk()}
              disabled={loading || !question.trim()}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white w-full sm:w-auto p-3 rounded-xl transition flex-shrink-0"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            AI answers are based only on your personal notes, not general
            knowledge.
          </p>
        </div>
      </div>
    </div>
  );
}
