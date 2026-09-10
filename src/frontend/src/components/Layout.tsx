import { Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";
import ClientsPage from "../pages/ClientsPage";
import TasksPage from "../pages/TasksPage";
import DashboardPage from "../pages/DashboardPage";
export default function Layout() { return <div><Navbar /><main><Routes><Route path="/clients" element={<ClientsPage />} /><Route path="/tasks" element={<TasksPage />} /><Route path="/dashboard" element={<DashboardPage />} /></Routes></main></div>; }
