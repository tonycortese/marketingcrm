import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/api-context";
import { SocketProvider } from "./lib/socket-context";
import Layout from "./components/Layout";
import CompaniesPage from "./pages/CompaniesPage";
import TasksPage from "./pages/TasksPage";
import DashboardPage from "./pages/DashboardPage";
import ActivitiesPage from "./pages/ActivitiesPage";
import Login from "./pages/Login";
import Register from "./pages/Register";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/companies" element={<CompaniesPage />} />
                    <Route path="/activities" element={<ActivitiesPage />} />
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                  </Routes>
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </SocketProvider>
    </AuthProvider>
  );
}
