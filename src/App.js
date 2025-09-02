import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from './components/Login';
import OperatorDashboard from './pages/OperatorDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import Settings from './components/Settings';
import Navbar from './components/Navbar';
import axios from 'axios';
import './App.css'
import RecordsTable from './components/RecordsTable';
import RecordsPage from './components/RecordsPage';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState(""); // operator or owner
  const [settings, setSettings] = useState({ companyName: 'My Company', tareWeight: 100 });
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedRole = localStorage.getItem("role");
    const savedLoggedIn = localStorage.getItem("loggedIn") === "true";

    if (savedRole && savedLoggedIn) {
      setRole(savedRole);
      setLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    if (role !== "operator" && role !== "owner") return;

    setLoading(true);
    axios
      .get("http://localhost/weightscale/index.php?action=getRecords")
      .then((res) => {
        if (res.data.status === "success") {
          setRecords(res.data.data || []);
        } else {
          console.error("Failed to load records", res.data);
          setRecords([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching records:", err);
        setRecords([]);
      })
      .finally(() => setLoading(false));
  }, [loggedIn, role]);

  const handleLogin = (userRole) => {
    setRole(userRole);
    setLoggedIn(true);
    localStorage.setItem("role", userRole);
    localStorage.setItem("loggedIn", "true");
  };

  const handleLogout = () => {
    setRole("");
    setLoggedIn(false);
    localStorage.removeItem("role");
    localStorage.removeItem("loggedIn");
  };

  

  return (
    <Router>
      {loggedIn && <Navbar onLogout={handleLogout} />}
      <Routes>
        <Route
          path="/"
          element={loggedIn ? (
            role === "operator" ? <Navigate to="/dashboard" /> : <Navigate to="/owner" />
          ) : (
            <Login onLogin={handleLogin} />
          )}
        />
        <Route
          path="/dashboard"
          element={loggedIn && role === "operator" ? (
            <OperatorDashboard settings={settings} records={records} setRecords={setRecords} />
          ) : (
            <Navigate to="/" />
          )}
        />
        <Route
          path="/owner"
          element={loggedIn && role === "owner" ? (
            <OwnerDashboard records={records} />
          ) : (
            <Navigate to="/" />
          )}
        />
        <Route
          path="/records"
          element={loggedIn ? (
            <RecordsPage records={records} />
          ) : (
            <Navigate to="/" />
          )}
        />
      </Routes>
    </Router>
  );
}

export default App;
