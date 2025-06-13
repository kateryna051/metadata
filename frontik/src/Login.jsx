
import React, { useState } from "react";
import { darkTheme, cardStyle, inputStyle, buttonStyle } from "./styles";
import { Link, useNavigate } from "react-router-dom";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Login successful!");
       onLogin();
        setTimeout(() => navigate("/"), 1000);
      } else {
        setMessage(`❌ Error: ${data.error || "Login failed"}`);
      }
    } catch (err) {
      setMessage(`❌ Network error: ${err.message}`);
    }
  };

  return (
    <div style={darkTheme}>
      <form style={cardStyle} onSubmit={handleSubmit}>
        <h2 style={{ marginBottom: 20, textAlign: "center" }}>Login</h2>

        <label>Username</label>
        <input
          type="text"
          style={inputStyle}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
        />

        <label style={{ marginTop: 15 }}>Password</label>
        <input
          type="password"
          style={inputStyle}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        <button type="submit" style={buttonStyle}>
          Login
        </button>

        {message && (
          <p style={{ marginTop: 15, fontWeight: "bold", whiteSpace: "pre-wrap" }}>
            {message}
          </p>
        )}
        <p style={{ marginTop: 20, color: "#bbb" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#61dafb", textDecoration: "none" }}>
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
}
