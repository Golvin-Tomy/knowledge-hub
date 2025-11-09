Knowledge Hub

A smart document management and AI-powered knowledge system that allows users to upload, search, and interact with their personal documents using intelligent search and question-answering features.

  Features

User Authentication: Secure login and registration with JWT-based authentication.

Role Management: Admin and user roles with protected routes.

Document Upload: Users can add, edit, and delete their own documents.

AI Summarization: Automatically generates summaries and tags for uploaded documents.

Semantic Search: Search documents using AI embeddings for meaning-based results.

Ask AI: Ask questions directly, and the AI responds based on document context.

Admin Panel: Manage users and documents with edit/delete access.

Responsive UI: Built with React and Tailwind CSS for a smooth user experience.

  Tech Stack

Frontend: React, Tailwind CSS, Lucide Icons, React Router
Backend: Node.js, Express.js, JWT Authentication
Database: MongoDB Atlas
AI Integration: Google Gemini API (text summarization, tagging, semantic search)
Other Tools: dotenv, bcryptjs, cors, mongoose

📂 Folder Structure
backend/
│
├── controllers/
│   ├── authController.js
│   ├── docController.js
│   ├── searchController.js
│   └── userController.js
│
├── middleware/
│   └── authMiddleware.js
│
├── models/
│   ├── userModel.js
│   └── docModel.js
│
├── routes/
│   ├── authRoutes.js
│   ├── docRoutes.js
│   ├── searchRoutes.js
│   └── userRoutes.js
│
├── utils/
│   └── gemini.js
│
└── index.js

⚙️ Installation and Setup

Clone the repository
git clone https://github.com/your-username/knowledge-hub.git
cd knowledge-hub


Install dependencies
npm install


Run the server
npm run dev


Frontend
cd frontend
npm install
npm run dev

🔐 Authentication Flow

JWT Tokens are generated upon successful login or registration.

Protected routes ensure only authorized users can create or view documents.

Admin routes are restricted to users with role: "admin".

🧩 AI Features

Summarization: Uses Gemini AI to summarize document content automatically.

Tag Generation: Generates keyword tags for faster search.

Semantic Search: Finds documents with similar meaning using embeddings.

Ask AI: Users can ask natural language questions, and AI responds contextually.



Golvin Tomy
Entry-Level Full-Stack Developer (MERN)
GitHub: github.com/Golvin-Tomy