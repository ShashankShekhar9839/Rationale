import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import CreateOrganization from "./pages/CreateOrganization";
import Projects from "./pages/Projects";
import ProjectDecisions from "./pages/ProjectDecisions";
import DecisionDocument from "./pages/DecisionDocument";

export default function App() {
  const { token, hasCompletedFirstSignup } = useAuth();
  const unauthenticatedLandingPath = hasCompletedFirstSignup ? "/login" : "/signup";

  return (
    <div className="min-h-screen flex flex-col">
      {token && <Header />}
      <main className="flex-1">
        <div className={token ? "container" : "mx-auto w-full max-w-6xl px-4"}>
          <Routes>
            {token ? (
              <>
                <Route path="/" element={<Home />} />
                <Route path="/organization" element={<CreateOrganization />} />
                <Route path="/workspaces/:workspaceId/projects" element={<Projects />} />
                <Route path="/projects/:projectId/decisions" element={<ProjectDecisions />} />
                <Route path="/decisions/:decisionId" element={<DecisionDocument />} />
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="/signup" element={<Navigate to="/" replace />} />
              </>
            ) : (
              <>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route
                  path="*"
                  element={<Navigate to={unauthenticatedLandingPath} replace />}
                />
              </>
            )}
          </Routes>
        </div>
      </main>
      {token && <Footer />}
    </div>
  );
}
