import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import MyDocsPage from "./pages/MyDocsPage";
import QAPage from "./pages/QAPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateAdminRoute from "./components/PrivateAdminRoute";
import AdminPanel from "./pages/AdminPanel";
import AdminDocsPanel from "./pages/AdminDocsPanel";
import GroupsPage from "./pages/GroupsPage";
import GroupDetailPage from "./pages/GroupDetailPage";
import ProfilePage from "./pages/ProfilePage";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/admin"
          element={
            <PrivateAdminRoute>
              <AdminPanel />
            </PrivateAdminRoute>
          }
        />
        <Route
          path="/admin/docs"
          element={
            <PrivateAdminRoute>
              <AdminDocsPanel />
            </PrivateAdminRoute>
          }
        />

        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="my-docs" element={<MyDocsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="qa" element={<QAPage />} />
                <Route path="groups" element={<GroupsPage />} />
                <Route path="groups/:id" element={<GroupDetailPage />} />
                {/* Redirects so old links don't break */}
                <Route path="search" element={<Navigate to="/my-docs" replace />} />
                <Route path="upload" element={<Navigate to="/my-docs" replace />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
