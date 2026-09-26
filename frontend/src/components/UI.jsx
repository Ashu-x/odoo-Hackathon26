import {
  CircleAlert,
  ClipboardCheck,
  History,
  LayoutDashboard,
  Package,
  PackageCheck,
  Truck,
  Warehouse,
  Search,
  SlidersHorizontal,
} from "lucide-react";

const iconMap = {
  layout: LayoutDashboard,
  package: Package,
  receipt: PackageCheck,
  truck: Truck,
  adjust: ClipboardCheck,
  history: History,
  warehouse: Warehouse,
};

export function Icon({ type, size = 17 }) {
  const Component = iconMap[type] || Package;
  return <Component size={size} strokeWidth={1.8} />;
}
export function Page({ title, eyebrow, action, children }) {
  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">{eyebrow || "WORKSPACE"}</div>
          <h1>{title}</h1>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
export function Status({ children }) {
  return (
    <span
      className={`status ${String(children).toLowerCase().replaceAll(" ", "-")}`}
    >
      {children}
    </span>
  );
}
export function FilterBar() {
  return (
    <div className="filter-bar">
      <label className="filter-search">
        <Search size={16} />
        <input placeholder="Search operations..." />
      </label>
      <select defaultValue="">
        <option value="">All document types</option>
        <option>Receipts</option>
        <option>Delivery Orders</option>
        <option>Internal Transfers</option>
        <option>Adjustments</option>
      </select>
      <select defaultValue="">
        <option value="">All statuses</option>
        <option>Waiting</option>
        <option>Ready</option>
        <option>Done</option>
        <option>Cancelled</option>
      </select>
      <select defaultValue="">
        <option value="">All warehouses</option>
        <option>Seattle Central</option>
        <option>Portland Hub</option>
      </select>
      <button className="filter-button">
        <SlidersHorizontal size={15} /> Filters
      </button>
    </div>
  );
}
export function SectionHeading({ title, description, action }) {
  return (
    <div className="section-head">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
export function DataState({ loading, error, empty, children }) {
  if (loading) return <div className="data-state">Loading data...</div>;
  if (error) return <div className="data-state error" role="alert">{error}</div>;
  if (empty) return <div className="data-state">No records found.</div>;
  return children;
}
export function OperationTable({ rows }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Document</th>
            <th>Type</th>
            <th>Product / movement</th>
            <th>Counterparty</th>
            <th>Status</th>
            <th>Updated</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]}>
              {row.map((cell, index) =>
                index === 4 ? (
                  <td key={index}>
                    <Status>{cell}</Status>
                  </td>
                ) : (
                  <td key={index} className={index === 0 ? "mono" : ""}>
                    {cell}
                  </td>
                ),
              )}
              <td>
                <button className="row-action">···</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export const kpiIcons = {
  alert: CircleAlert,
  package: Package,
  receipt: PackageCheck,
  truck: Truck,
};
