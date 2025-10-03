import React from "react";

export default function DocList({ docs, onEdit, onDelete }) {
  return (
    <ul>
      {docs.map((doc) => (
        <li key={doc._id} style={{ marginBottom: "15px" }}>
          <strong>{doc.title}</strong> - {doc.content.substring(0, 50)}...
          <br />
          {doc.tags && doc.tags.length > 0 && (
            <small>Tags: {doc.tags.join(", ")}</small>
          )}
          <br />
          <button onClick={() => onDelete(doc._id)}>Delete</button>{" "}
          <button onClick={() => onEdit(doc)}>Edit</button>
        </li>
      ))}
    </ul>
  );
}
