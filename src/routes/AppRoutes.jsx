import { Route, Routes } from "react-router";
import GoogleSignIn from "../components/GoogleSignIn.jsx";
import DashboardPage from "../pages/DashBoardPage.jsx";
import ProtectedRoute from "./ProtectedRoutes.jsx";
import LoginPage from "../pages/LoginPage.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/sso/google" element={<GoogleSignIn />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>
    </Routes>
  );
}
