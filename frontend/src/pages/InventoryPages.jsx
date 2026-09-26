import { useState } from "react";
import { api } from "../api/client";
import { Modal } from "../components/UI";

import {
  ArrowRightLeft,
  CircleAlert,
  ClipboardList,
  MapPin,
  Package,
  PackageCheck,
  Plus,
  SlidersHorizontal,
  Truck,
  Warehouse,
} from "lucide-react";
import {
  FilterBar,
  DataState,
  OperationTable,
  Page,
  SectionHeading,
  Status,
} from "../components/UI";
import { Field } from "../components/Form";
import { useApi } from "../hooks/useApi";
import { operationRow, productRow } from "../data/adapters";

export function Dashboard() {
  const { data: user } = useApi("/api/auth/me", {});
  const { data: kpis, loading: kpisLoading, error: kpisError } = useApi("/api/dashboard/kpis", {});
  const { data: recentOperations, loading: operationsLoading, error: operationsError } = useApi("/api/dashboard/operations", []);

  const firstName = user.name ? user.name.split(" ")[0] : "User";
  const isManager = user.role === 'INVENTORY_MANAGER';
  const metrics = [
    ["Total products in stock", kpis.total_products_in_stock ?? "-", "Live total", "teal", Package],
    ["Low stock items", kpis.low_stock_items ?? "-", "Needs attention", "amber", CircleAlert],
    ["Out of stock items", kpis.out_of_stock_items ?? "-", "Review today", "rose", Package],
    ["Pending receipts", kpis.pending_receipts ?? "-", "Not completed", "violet", PackageCheck],
    ["Pending deliveries", kpis.pending_deliveries ?? "-", "Not completed", "teal", Truck],
    ["Transfers scheduled", kpis.internal_transfers_scheduled ?? "-", "Not completed", "violet", ArrowRightLeft],
  ];
  return (
    <Page
      title={`Good morning, ${firstName}`}
      eyebrow="OPERATIONS OVERVIEW"
      action={
        isManager && (
          <button className="primary-button">
            <Plus size={16} /> New operation
          </button>
        )
      }
    >
      <div className="kpi-grid">
        {metrics.map(([label, value, detail, color, Icon]) => (
          <div className="kpi-card" key={label}>
            <div className={`kpi-icon ${color}`}>
              <Icon size={17} />
            </div>
            <div className="kpi-copy">
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{detail}</small>
            </div>
          </div>
        ))}
      </div>
      <SectionHeading
        title="Recent operations"
        description="Stay close to the movements that need attention."
        action={
          <button className="text-button">
            View all <span>→</span>
          </button>
        }
      />
      <FilterBar />
      <DataState loading={kpisLoading || operationsLoading} error={kpisError || operationsError} empty={!recentOperations.length}>
        <OperationTable rows={recentOperations.map(operationRow)} />
      </DataState>
    </Page>
  );
}

export function Products() {
  const [query, setQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ name: "", sku: "", categoryId: "", unitOfMeasure: "Units" });

  const { data: productData, loading, error, refetch } = useApi(`/api/products${query ? `?search=${encodeURIComponent(query)}` : ""}`, []);
  const { data: categories } = useApi("/api/categories", []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/api/products", form);
    setIsAdding(false);
    refetch();
  };

  const visibleProducts = productData.map(productRow);

  return (
    <Page title="Products" eyebrow="CATALOG" action={<button onClick={() => setIsAdding(true)} className="primary-button"><Plus size={16} /> Add product</button>}>
      {/* Existing stat-strip and filter-bar go here */}

      <DataState loading={loading} error={error} empty={!visibleProducts.length}>
        {/* Existing table goes here */}
      </DataState>

      {isAdding && (
        <Modal title="Add New Product" onClose={() => setIsAdding(false)}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Field label="Product Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Field label="SKU" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
            <label className="field">
              <span>Category</span>
              <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} required>
                <option value="">Select category...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <Field label="Unit of Measure" value={form.unitOfMeasure} onChange={e => setForm({ ...form, unitOfMeasure: e.target.value })} />
            <button type="submit" className="submit-button" style={{ marginTop: '10px' }}>Save Product</button>
          </form>
        </Modal>
      )}
    </Page>
  );
}

export function OperationsPage({ type }) {
  const { data: user } = useApi("/api/auth/me", {});
  const isManager = user.role === 'INVENTORY_MANAGER';
  const isHistory = type === "move-history";
  const [status, setStatus] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const canCreate = !isHistory && isManager;

  const title = type === "receipts" ? "Receipts" : type === "delivery-orders" ? "Delivery orders" : "Move history";

  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (warehouseId) params.append("warehouseId", warehouseId);
  const queryStr = params.toString() ? `?${params.toString()}` : "";

  const endpoint = isHistory ? `/api/stock-moves${queryStr}` : `/api/${type}${queryStr}`;
  const { data, loading, error, refetch } = useApi(endpoint, []);
  const { data: warehouses } = useApi("/api/warehouses", []);

  const handleValidate = async (id) => {
    try {
      await api.post(`/api/${type}/${id}/validate`, {});
      refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Page
      title={title}
      eyebrow={isHistory ? "AUDIT LEDGER" : "OPERATIONS"}
      action={
        canCreate && (
          <button className="primary-button">
            <Plus size={16} /> New {type === "receipts" ? "receipt" : "delivery"}
          </button>
        )
      }
    >
      <SectionHeading title={`All ${title.toLowerCase()}`} description="Filter, review, and move work through its next step." />
      <FilterBar
        status={status} onStatusChange={setStatus}
        warehouse={warehouseId} onWarehouseChange={setWarehouseId}
        warehouses={warehouses}
      />
      <DataState loading={loading} error={error} empty={!data.length}>
        <OperationTable
          rows={data.map(operationRow)}
          actionLabel={isHistory ? null : "Validate"}
          onAction={isHistory ? null : handleValidate}
        />
      </DataState>
    </Page>
  );
}

export function AdjustmentPage() {
  const { data: user } = useApi("/api/auth/me", {});
  const { data, loading, error } = useApi("/api/stock-adjustments", []);
  return (
    <Page
      title="Inventory adjustment"
      eyebrow="OPERATIONS"
      action={
        <button className="primary-button">
          <Plus size={16} /> New adjustment
        </button>
      }
    >
      <div className="adjustment-intro">
        <div className="adjustment-icon">
          <ClipboardList size={19} />
        </div>
        <div>
          <h2>Physical count adjustments</h2>
          <p>
            Compare counted stock with the trusted inventory record, then apply
            the difference with a clear audit trail.
          </p>
        </div>
      </div>
      <SectionHeading
        title="Recent adjustments"
        description="Review discrepancies and validations from your warehouse network."
      />
      <FilterBar />
      <DataState loading={loading} error={error} empty={!data.length}>
        <OperationTable rows={data.map(operationRow)} />
      </DataState>
    </Page>
  );
}

export function WarehousePage() {
  const { data: warehouses, loading, error, refetch } = useApi("/api/warehouses", []);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ name: "", code: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/api/warehouses", form);
    setIsAdding(false);
    refetch();
  };

  return (
    <Page title="Warehouse settings" eyebrow="SETTINGS" action={<button onClick={() => setIsAdding(true)} className="primary-button"><Plus size={16} /> Add warehouse</button>}>
      <DataState loading={loading} error={error} empty={!warehouses.length}>
        <div className="warehouse-grid">
          {warehouses.map((warehouse) => (
            /* Existing warehouse card mapping */
            <div className="warehouse-card" key={warehouse.id}>
              <div className="warehouse-icon"><Warehouse size={20} /></div>
              <div><h3>{warehouse.name}</h3><span>{warehouse.code}</span></div>
              <Status>Active</Status>
            </div>
          ))}
        </div>
      </DataState>

      {isAdding && (
        <Modal title="Add Warehouse" onClose={() => setIsAdding(false)}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Field label="Warehouse Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Field label="Short Code" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
            <button type="submit" className="submit-button" style={{ marginTop: '10px' }}>Create Warehouse</button>
          </form>
        </Modal>
      )}
    </Page>
  );
}

export function Profile() {
  const { data: user, loading, error } = useApi("/api/auth/me", {});

  return (
    <Page title="My profile" eyebrow="ACCOUNT">
      <DataState loading={loading} error={error}>
        <div className="profile-card">
          <div className="large-avatar">
            {user.name ? user.name.substring(0, 2).toUpperCase() : "US"}
          </div>
          <div className="profile-details">
            <h2>{user.name}</h2>
            <p>{user.role?.replace('_', ' ')}</p>
            <div className="form-grid">
              <Field label="Full name" value={user.name || ""} disabled />
              <Field
                label="Email address"
                value={user.email || ""}
                disabled
              />
              <Field label="Role" value={user.role || ""} disabled />
            </div>
            <button className="primary-button" disabled>Save changes</button>
          </div>
        </div>
      </DataState>
    </Page>
  );
}
