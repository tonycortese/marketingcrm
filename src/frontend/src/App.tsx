import { AuthProvider } from "./lib/api-context";
import { Routes, Route, Navigate } from "react-router-dom";
import ClientsPage from "./pages/ClientsPage";
import TasksPage from "./pages/TasksPage";
import DashboardPage from "./pages/DashboardPage";
export default function App() {
  return <AuthProvider><Routes><Route path="/" element={<Navigate to="/clients" />} /><Route path="/clients" element={<ClientsPage />} /><Route path="/tasks" element={<TasksPage />} /><Route path="/dashboard" element={<DashboardPage />} /></Routes></AuthProvider>;
}
