import React, { useState } from "react";
import { Edit3, Trash2, Tag } from "lucide-react";

export default function DocList({ docs, onEdit, onDelete }) {
  if (!docs || docs.length === 0) {
    return (
      <p className="text-center text-gray-500 italic">
        No documents.
      </p>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {docs.map((doc) => (
        <DocCard
          key={doc._id}
          doc={doc}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function DocCard({ doc, onEdit, onDelete }) {
  const [showFull, setShowFull] = useState(false);
  const contentLimit = 120; // characters before truncation

  const handleToggle = () => setShowFull((prev) => !prev);

  const truncatedContent =
    doc.content.length > contentLimit && !showFull
      ? doc.content.slice(0, contentLimit) + "..."
      : doc.content;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between">
      {/* Title */}
      <h4 className="text-xl font-semibold text-green-700 mb-2">
        {doc.title}
      </h4>

      {/* Content with Read More toggle */}
      <p className="text-gray-700 text-sm mb-2">
        {truncatedContent}
        {doc.content.length > contentLimit && (
          <button
            onClick={handleToggle}
            className="text-green-600 ml-1 font-medium hover:underline"
          >
            {showFull ? "Show less" : "Read more"}
          </button>
        )}
      </p>

      {/* Tags */}
      {doc.tags && doc.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {doc.tags.map((tag, i) => (
            <span
              key={i}
              className="flex items-center text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full"
            >
              <Tag size={12} className="mr-1" /> {tag}
            </span>
          ))}
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-end gap-3 mt-2">
        <button
          onClick={() => onEdit(doc)}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          <Edit3 size={16} /> Edit
        </button>
        <button
          onClick={() => onDelete(doc._id)}
          className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium"
        >
          <Trash2 size={16} /> Delete
        </button>
      </div>
    </div>
  );
}
