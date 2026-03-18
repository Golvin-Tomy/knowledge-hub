import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import UploadPage from "./pages/UploadPage";
import SearchPage from "./pages/SearchPage";
import QAPage from "./pages/QAPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateAdminRoute from "./components/PrivateAdminRoute";
import AdminPanel from "./pages/AdminPanel";
import AdminDocsPanel from "./pages/AdminDocsPanel";

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
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="upload" element={<UploadPage />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="qa" element={<QAPage />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
