// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import Login from "./Login";
import Register from "./Register";
import "./App.css";

function UploadPage({ onLogout }) {
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("No file chosen");

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFileName(file.name);
    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5000/upload", formData);
      setMetadata(response.data);
    } catch (err) {
      alert("Error uploading file");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAndDownload = async () => {
    try {
      const response = await axios.post("http://localhost:5000/generate_excel", metadata);
      const filename = response.data.filename;
      setSuccessMessage("✅ Excel File generated and downloading...");
      window.open(`http://localhost:5000/download_excel/${filename}`, "_blank");
    } catch (err) {
      alert("Error generating or downloading Excel");
      console.error(err);
    }
  };

  const renderTable = () => {
    if (!metadata || metadata.length === 0) return null;

    const allKeys = Array.from(
      new Set(metadata.flatMap((item) => Object.keys(item)))
    );

    return (
      <div className="table-scroll-wrapper">
    <table className="metadata-table">
      <thead>
        <tr>{allKeys.map((key) => <th key={key}>{key}</th>)}</tr>
      </thead>
      <tbody>
        {metadata.map((item, idx) => (
          <tr key={idx}>
            {allKeys.map((key) => (
              <td key={key}>{item[key] || "-"}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
    );
  };

  return (
    <div className="app-container">
      <h1>🎥 Video Metadata Extractor</h1>
      <div className="top-right">
        <button onClick={onLogout} className="logout-button">
          🚪 Logout
        </button>
      </div>

      <div className="file-upload-wrapper">
        <label htmlFor="file-upload" className="custom-file-upload">
          📂 Choose File
        </label>
        <input id="file-upload" type="file" accept="video/*" onChange={handleUpload} />
        <span className="file-name">{selectedFileName}</span>
      </div>

      {loading && <p className="loading">⏳ Loading metadata...</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      {renderTable()}

      {metadata && (
        <div style={{ marginTop: "1rem" }}>
          <button onClick={handleGenerateAndDownload}>Generate & Download Excel File</button>
        </div>
      )}
    </div>
  );
}

function App() {
  // Simple auth flag, can be replaced with JWT/session
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);


  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <UploadPage onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Register />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
