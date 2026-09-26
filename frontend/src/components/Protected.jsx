import { Navigate } from "react-router-dom";

export default function Protected({ children }) {
  return localStorage.getItem("stocksense_token") ? (
    children
  ) : (
    <Navigate to="/login" replace />
  );
}