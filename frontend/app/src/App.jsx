import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/register";
import Dashboard from "./pages/Dashboard";
import AgentsPage from "./pages/AgentsPage";
import UploadPage from "./pages/UploadPage";
import { useState } from "react";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  return (
    <Router>
      <Routes>
        <Route path="/" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage setToken={setToken} />} />

        {/* Protected Dashboard Layout */}
        <Route
          path="/dashboard"
          element={token ? <Dashboard /> : <Navigate to="/login" />}
        >
          {/* Default: redirect /dashboard -> /dashboard/agents */}
          <Route index element={<Navigate to="agents" replace />} />
          
          <Route path="agents" element={<AgentsPage />} />
          <Route path="upload" element={<UploadPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
