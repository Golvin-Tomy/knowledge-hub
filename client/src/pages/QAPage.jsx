import React, { useState } from "react";
import { askQuestion } from "../services/DocService";

export default function QAPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleAsk = async () => {
    if (!question.trim()) return;
    const res = await askQuestion(question);
    setAnswer(res.answer);
  };

  return (
    <div>
      <h2>Ask a Question</h2>
      <input
        type="text"
        placeholder="Ask about your docs..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <button onClick={handleAsk}>Ask</button>

      {answer && (
        <div>
          <h4>Answer:</h4>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}


