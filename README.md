# 🧠 Knowledge Hub — AI-Powered Collaborative Learning Platform

A full-stack AI-powered knowledge management platform where students can organize personal notes, collaborate in groups, and get intelligent answers using Retrieval-Augmented Generation (RAG).

## 🌐 Live Demo
[knowledge-hub.vercel.app](https://knowledge-hub-ten-lovat.vercel.app)

## ✨ Features

### 📝 Personal Notes
- Create, edit, and delete personal notes
- AI-generated summaries and tags on every note
- Keyword search and semantic (meaning-based) search
- Ask AI questions answered from your own notes (RAG)

### 👥 Group Collaboration
- Create study groups with auto-generated invite codes
- Join groups via invite code
- Share notes with group members
- Group semantic search — searches all members' notes
- Group Ask AI — answers generated from group notes only

### 🤖 AI Features
- **Semantic Search** — finds notes by meaning, not just keywords
- **RAG-based Q&A** — AI answers using only your notes as context
- **Auto Summary** — AI summarizes every note on save
- **Auto Tags** — AI generates relevant tags automatically

### 🌍 Social Feed
- Public knowledge feed
- Follow/unfollow users
- Personalized feed showing only followed users' posts
- Load more pagination

### 🔐 Authentication & Roles
- JWT-based authentication
- Role-based access (Admin / User)
- Admin panel for managing users and documents
- Profile page with edit and following list

## 🛠️ Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Router v6
- Axios
- Lucide React Icons

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- BCrypt password hashing

### AI & ML
- **OpenRouter API** — LLM text generation (RAG, summarization, tagging)
- **HuggingFace** — `all-MiniLM-L6-v2` sentence embeddings
- **MongoDB Atlas Vector Search** — semantic similarity search

## 🏗️ Architecture
```
Frontend (React/Vite) → Vercel
Backend (Node/Express) → Render
Database (MongoDB Atlas) → Cloud
Vector Search → MongoDB Atlas Vector Index
Embeddings → HuggingFace MiniLM (384 dimensions)
LLM → OpenRouter (Llama/Gemma free models)
```

## 📁 Project Structure
```
Knowledge-hub/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── docController.js
│   │   ├── groupController.js
│   │   └── userController.js
│   ├── models/
│   │   ├── userModel.js
│   │   ├── docModel.js
│   │   └── groupModel.js
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   │   └── gemini.js (AI utilities)
│   └── server.js
└── frontend/
    └── src/
        ├── pages/
        │   ├── Dashboard.jsx
        │   ├── MyDocsPage.jsx
        │   ├── GroupsPage.jsx
        │   ├── GroupDetailPage.jsx
        │   ├── QAPage.jsx
        │   ├── ProfilePage.jsx
        │   ├── Login.jsx
        │   └── Register.jsx
        ├── components/
        └── api.js
```

## 🔑 Demo Account
Email: `demo@knowledgehub.com`
Password: `Demo@123`

## 👨‍💻 Author
 
**Golvin Tomy**
https://www.linkedin.com/in/golvin-tomy-aa1901244/

## 📄 License
MIT
```
