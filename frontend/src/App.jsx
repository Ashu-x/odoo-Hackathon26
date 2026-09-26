import { Routes, Route } from "react-router-dom";
import AuthScreens from "./AuthScreens";
import Protected from "./components/Protected";
import ProtectedRoutes from "./components/ProtectedRoutes";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthScreens mode="login" />} />
      <Route path="/signup" element={<AuthScreens mode="signup" />} />
      <Route
        path="*"
        element={
          <Protected>
            <ProtectedRoutes />
          </Protected>
        }
      />
    </Routes>
  );
}
