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
export function FilterBar({ status, onStatusChange, warehouse, onWarehouseChange, warehouses = [] }) {
  return (
    <div className="filter-bar">
      <label className="filter-search">
        <Search size={16} />
        <input placeholder="Search operations..." />
      </label>
      <select value={status || ""} onChange={(e) => onStatusChange && onStatusChange(e.target.value)}>
        <option value="">All statuses</option>
        <option value="DRAFT">Draft</option>
        <option value="WAITING">Waiting</option>
        <option value="READY">Ready</option>
        <option value="DONE">Done</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
      <select value={warehouse || ""} onChange={(e) => onWarehouseChange && onWarehouseChange(e.target.value)}>
        <option value="">All warehouses</option>
        {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
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

export function OperationTable({ rows, actionLabel, onAction }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Document</th>
            <th>Type</th>
            <th>Movement</th>
            <th>Counterparty</th>
            <th>Status</th>
            <th>Updated</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id || i}>
              {row.cells.map((cell, index) =>
                index === 4 ? (
                  <td key={index}><Status>{cell}</Status></td>
                ) : (
                  <td key={index} className={index === 0 ? "mono" : ""}>{cell}</td>
                )
              )}
              <td>
                {onAction && row.cells[4] !== 'DONE' && row.cells[4] !== 'CANCELLED' && (
                  <button onClick={() => onAction(row.id)} className="text-button">
                    {actionLabel || "Action"}
                  </button>
                )}
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

export function Modal({ title, onClose, children }) {
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(4, 42, 43, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontFamily: 'Plus Jakarta Sans', color: '#173437' }}>{title}</h3>
            <button onClick={onClose} style={{ color: '#789091' }}>✕</button>
          </div>
          {children}
        </div>
      </div>
    );
  }