import React, { useState } from "react";
import { searchDoc, semanticSearchDocs } from "../services/DocService";
import DocList from "../components/DocList";

export default function SearchPage() {
  const [docs, setDocs] = useState([]);
  const [query, setQuery] = useState("");
  const [semanticQuery, setSemanticQuery] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;
    const results = await searchDoc(query);
    setDocs(results);
  };

  const handleSemanticSearch = async () => {
    if (!semanticQuery.trim()) return;
    const results = await semanticSearchDocs(semanticQuery);
    setDocs(results);
  };

  return (
    <div>
      <h2>Search Documents</h2>
      <input
        type="text"
        placeholder="Regular search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>

      <input
        type="text"
        placeholder="Semantic search..."
        value={semanticQuery}
        onChange={(e) => setSemanticQuery(e.target.value)}
      />
      <button onClick={handleSemanticSearch}>Semantic Search</button>

      <DocList docs={docs} onEdit={() => {}} onDelete={() => {}} />
    </div>
  );
}


