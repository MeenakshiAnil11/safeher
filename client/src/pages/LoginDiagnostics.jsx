// client/src/pages/LoginDiagnostics.jsx
import React, { useState, useEffect } from "react";
import api from "../services/api";

export default function LoginDiagnostics() {
  const [diagnostics, setDiagnostics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    checkDiagnostics();
  }, []);

  const checkDiagnostics = async () => {
    try {
      setLoading(true);
      const res = await api.get("/auth/diagnostics");
      setDiagnostics(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch diagnostics");
      console.error("Diagnostics error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading diagnostics...</div>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Login Diagnostics</h1>
      
      {error && (
        <div style={{ 
          padding: "15px", 
          backgroundColor: "#fee", 
          border: "1px solid #fcc",
          borderRadius: "5px",
          marginBottom: "20px"
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {diagnostics && (
        <div>
          <h2>Database Status</h2>
          <div style={{
            padding: "15px",
            backgroundColor: diagnostics.database.connected ? "#efe" : "#fee",
            border: `1px solid ${diagnostics.database.connected ? "#cfc" : "#fcc"}`,
            borderRadius: "5px",
            marginBottom: "20px"
          }}>
            <p><strong>Status:</strong> {diagnostics.database.readyStateText}</p>
            <p><strong>Connected:</strong> {diagnostics.database.connected ? "✅ Yes" : "❌ No"}</p>
            <p><strong>Host:</strong> {diagnostics.database.host}</p>
            <p><strong>Database:</strong> {diagnostics.database.database}</p>
          </div>

          <h2>Users in Database</h2>
          <div style={{
            padding: "15px",
            backgroundColor: "#f9f9f9",
            border: "1px solid #ddd",
            borderRadius: "5px",
            marginBottom: "20px"
          }}>
            <p><strong>Total Users:</strong> {diagnostics.users.count}</p>
            
            {diagnostics.users.count > 0 ? (
              <div style={{ marginTop: "15px" }}>
                <h3>Sample Users (first 5):</h3>
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#eee" }}>
                      <th style={{ padding: "8px", textAlign: "left", border: "1px solid #ddd" }}>Name</th>
                      <th style={{ padding: "8px", textAlign: "left", border: "1px solid #ddd" }}>Email</th>
                      <th style={{ padding: "8px", textAlign: "left", border: "1px solid #ddd" }}>Role</th>
                      <th style={{ padding: "8px", textAlign: "left", border: "1px solid #ddd" }}>Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diagnostics.users.sample.map((user, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: "8px", border: "1px solid #ddd" }}>{user.name}</td>
                        <td style={{ padding: "8px", border: "1px solid #ddd" }}>{user.email}</td>
                        <td style={{ padding: "8px", border: "1px solid #ddd" }}>{user.role}</td>
                        <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                          {user.isActive ? "✅ Yes" : "❌ No"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: "#c00", marginTop: "10px" }}>
                ⚠️ No users found in database. You need to register a new account first.
              </p>
            )}
          </div>

          <div style={{
            padding: "15px",
            backgroundColor: diagnostics.database.connected ? "#e3f2fd" : "#fff3cd",
            border: `1px solid ${diagnostics.database.connected ? "#90caf9" : "#ffc107"}`,
            borderRadius: "5px"
          }}>
            <p><strong>Message:</strong> {diagnostics.message}</p>
          </div>

          <div style={{ marginTop: "20px" }}>
            <button 
              onClick={checkDiagnostics}
              style={{
                padding: "10px 20px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer"
              }}
            >
              Refresh Diagnostics
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
