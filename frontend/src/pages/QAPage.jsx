import React, { useState } from "react";
import { askQuestion } from "../services/DocService";
import { MessageSquare } from "lucide-react";

export default function QAPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleAsk = async () => {
    if (!question.trim()) return;
    const res = await askQuestion(question);
    setAnswer(res.answer);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Page Title */}
      <h2 className="text-3xl font-bold text-green-700 mb-8 text-center">
        Ask a Question
      </h2>

      {/* Question Input */}
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask about your docs..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleAsk}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-lg transition"
          >
            <MessageSquare size={16} /> Ask
          </button>
        </div>

        {/* Answer Box */}
        {answer && (
          <div className="bg-white p-6 rounded-2xl shadow-md mt-6">
            <h4 className="text-xl font-semibold text-gray-700 mb-2">Answer:</h4>
            <p className="text-gray-700">{answer}</p>
          </div>
        )}
      </div>
    </div>
  );
}
