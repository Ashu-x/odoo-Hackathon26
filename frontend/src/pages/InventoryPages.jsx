import { useState } from "react";
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
  const { data: kpis, loading: kpisLoading, error: kpisError } = useApi("/api/dashboard/kpis", {});
  const { data: recentOperations, loading: operationsLoading, error: operationsError } = useApi("/api/dashboard/operations", []);
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
      title="Good morning, Maya"
      eyebrow="OPERATIONS OVERVIEW"
      action={
        <button className="primary-button">
          <Plus size={16} /> New operation
        </button>
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
  const { data: productData, loading, error } = useApi(`/api/products${query ? `?search=${encodeURIComponent(query)}` : ""}`, []);
  const visibleProducts = productData.map(productRow);
  return (
    <Page
      title="Products"
      eyebrow="CATALOG"
      action={
        <button className="primary-button">
          <Plus size={16} /> Add product
        </button>
      }
    >
      <div className="stat-strip">
        <div>
          <span>Active products</span>
          <strong>248</strong>
        </div>
        <div>
          <span>Categories</span>
          <strong>12</strong>
        </div>
        <div>
          <span>Low stock rules</span>
          <strong>18</strong>
        </div>
        <div>
          <span>Locations tracked</span>
          <strong>6</strong>
        </div>
      </div>
      <SectionHeading
        title="Product catalog"
        description="Search and manage everything your warehouses carry."
      />
      <div className="filter-bar">
        <label className="filter-search">
          <SlidersHorizontal size={16} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or SKU..." />
        </label>
        <select>
          <option>All categories</option>
          <option>Raw materials</option>
          <option>Furniture</option>
          <option>Consumables</option>
        </select>
        <button className="filter-button">
          <SlidersHorizontal size={15} /> Filters
        </button>
      </div>
      <DataState loading={loading} error={error} empty={!visibleProducts.length}>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU / Code</th>
              <th>Category</th>
              <th>Unit</th>
              <th>Available stock</th>
              <th>Primary location</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {visibleProducts.map((row) => (
              <tr key={row[1]}>
                {row.map((cell, index) => (
                  <td
                    key={index}
                    className={
                      index === 0 ? "product-cell" : index === 1 ? "mono" : ""
                    }
                  >
                    {index === 0 && <span className="product-dot" />}
                    {cell}
                  </td>
                ))}
                <td>
                  <button className="row-action">···</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </DataState>
    </Page>
  );
}

export function OperationsPage({ type }) {
  const title =
    type === "receipts"
      ? "Receipts"
      : type === "delivery-orders"
        ? "Delivery orders"
        : "Move history";
  const isHistory = type === "move-history";
  const endpoint = isHistory ? "/api/stock-moves" : `/api/${type}`;
  const { data, loading, error } = useApi(endpoint, []);
  return (
    <Page
      title={title}
      eyebrow={isHistory ? "AUDIT LEDGER" : "OPERATIONS"}
      action={
        !isHistory && (
          <button className="primary-button">
            <Plus size={16} /> New{" "}
            {type === "receipts" ? "receipt" : "delivery"}
          </button>
        )
      }
    >
      <SectionHeading
        title={
          isHistory ? "Stock movement ledger" : `All ${title.toLowerCase()}`
        }
        description={
          isHistory
            ? "Every stock movement, with its source document and location trail."
            : "Filter, review, and move work through its next step."
        }
      />
      <FilterBar />
      <DataState loading={loading} error={error} empty={!data.length}>
        <OperationTable rows={data.map(operationRow)} />
      </DataState>
    </Page>
  );
}

export function AdjustmentPage() {
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
  const { data: warehouses, loading, error } = useApi("/api/warehouses", []);
  return (
    <Page
      title="Warehouse settings"
      eyebrow="SETTINGS"
      action={
        <button className="primary-button">
          <Plus size={16} /> Add warehouse
        </button>
      }
    >
      <DataState loading={loading} error={error} empty={!warehouses.length}>
      <div className="warehouse-grid">
        {warehouses.map((warehouse) => (
          <div className="warehouse-card" key={warehouse.id}>
            <div className="warehouse-icon">
              <Warehouse size={20} />
            </div>
            <div>
              <h3>{warehouse.name}</h3>
              <span>
                {warehouse.code}
              </span>
            </div>
            <Status>Active</Status>
            <div className="warehouse-foot">
              <MapPin size={14} /> Manage locations <span>→</span>
            </div>
          </div>
        ))}
      </div>
      </DataState>
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
