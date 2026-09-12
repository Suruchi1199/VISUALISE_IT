import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Classes from "./pages/Classes.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Subjects from "./pages/Subjects.jsx";
import SubjectDetail from "./pages/SubjectDetail.jsx";
import ChapterDetail from "./pages/ChapterDetail.jsx";
import TopicDetail from "./pages/TopicDetail.jsx";
import GraphPlotting from "./pages/Graphplotting.jsx";
import Settings from "./pages/Settings.jsx";
import CoordinateGeometryVisualizer from "./class9/CoordinateGeometryVisualizer.jsx";

function ProtectedLayout({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Navbar />
        <div className="app-content">{children}</div>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return null;

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Navigate to={user ? "/" : "/?auth=signin"} replace />} />
      <Route path="/register" element={<Navigate to={user ? "/" : "/?auth=signup"} replace />} />
      <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
      <Route path="/classes" element={<ProtectedLayout><Classes /></ProtectedLayout>} />
      <Route path="/classes/:classId" element={<ProtectedLayout><Subjects /></ProtectedLayout>} />
      <Route path="/classes/:classId/:subjectId/:chapterId" element={<ProtectedLayout><ChapterDetail /></ProtectedLayout>} />
      <Route path="/classes/:classId/:subjectId/:topicId" element={<ProtectedLayout><TopicDetail /></ProtectedLayout>} />
      <Route path="/classes/:classId/:subjectId" element={<ProtectedLayout><SubjectDetail /></ProtectedLayout>} />
      <Route path="/subjects" element={<Navigate to="/classes" replace />} />
      <Route path="/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />
      <Route path="/graphplotting" element={<ProtectedLayout><GraphPlotting /></ProtectedLayout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
