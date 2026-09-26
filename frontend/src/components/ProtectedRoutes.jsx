import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./Layout";
import {
  AdjustmentPage,
  Dashboard,
  OperationsPage,
  Products,
  Profile,
  WarehousePage,
} from "../pages/InventoryPages";

export default function ProtectedRoutes() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/receipts" element={<OperationsPage type="receipts" />} />
        <Route
          path="/delivery-orders"
          element={<OperationsPage type="delivery-orders" />}
        />
        <Route path="/adjustments" element={<AdjustmentPage />} />
        <Route
          path="/move-history"
          element={<OperationsPage type="move-history" />}
        />
        <Route path="/warehouse" element={<WarehousePage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}