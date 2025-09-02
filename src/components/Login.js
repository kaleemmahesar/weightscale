import { useState } from "react";
import axios from "axios";
import logo from "../assets/logo512.png"; // // place your logo in src/assets

export default function Login({ onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) {
            alert("Please enter username and password");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(
                "http://localhost/weightscale/index.php?action=login",
                { username, password }
            );

            if (res.data.status === "success") {
                onLogin(res.data.role);
            } else {
                alert(res.data.message);
            }
        } catch (err) {
            console.error(err);
            alert("Login error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="d-flex align-items-center justify-content-center vh-100"
            style={{ background: "#f4f7fa" }}
        >
            <div className="card shadow-lg p-4" style={{ width: "480px", borderRadius: "15px" }}>
                <div className="text-center mb-4">
                    <img src={logo} alt="Company Logo" style={{ width: "120px" }} />
                    <h3 className="mt-3">Awami Computerized Kanta</h3>
                </div>
                <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input
                        type="text"
                        className="form-control"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username"
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                    />
                </div>
                <button
                    className="btn btn-primary w-100"
                    onClick={handleLogin}
                    disabled={loading}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
                <div className="text-center mt-3 text-muted">
                    © {new Date().getFullYear()} My Company
                </div>
            </div>
        </div>
    );
}
