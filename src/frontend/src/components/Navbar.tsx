import { Link } from "react-router-dom";
export default function Navbar() {
  return <nav style={{ background: "#fff", padding: "12px 20px", borderBottom: "1px solid #ddd", display: "flex", gap: 20 }}><Link to="/clients" style={{ marginRight: 16, color: "#1976d2" }}>Clienti</Link><Link to="/tasks" style={{ marginRight: 16, color: "#1976d2" }}>Task</Link><Link to="/dashboard" style={{ marginRight: 16, color: "#1976d2" }}>Dashboard</Link></nav>;
}
