import { pool } from '../config/db.js';

export async function listStockMoves(query = {}) {
  const values = [];
  const where = [];
  if (query.productId) { values.push(query.productId); where.push(`sm.product_id = $${values.length}`); }
  if (query.locationId) { values.push(query.locationId); where.push(`(sm.from_location_id = $${values.length} OR sm.to_location_id = $${values.length})`); }
  if (query.type) { values.push(query.type); where.push(`sm.move_type = $${values.length}`); }
  if (query.from) { values.push(query.from); where.push(`sm.created_at >= $${values.length}`); }
  if (query.to) { values.push(query.to); where.push(`sm.created_at <= $${values.length}`); }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  return (await pool.query(`SELECT sm.*, p.name AS product_name, p.sku, fl.name AS from_location_name, tl.name AS to_location_name FROM stock_moves sm JOIN products p ON p.id = sm.product_id LEFT JOIN locations fl ON fl.id = sm.from_location_id LEFT JOIN locations tl ON tl.id = sm.to_location_id ${clause} ORDER BY sm.created_at DESC`, values)).rows;
}

export async function getKpis() {
  const query = `
    SELECT 
      (SELECT COUNT(DISTINCT product_id) FROM product_stock WHERE quantity > 0) AS total_products_in_stock, 
      (SELECT COUNT(*) FROM (SELECT p.id, COALESCE(SUM(ps.quantity), 0) AS total, rr.min_qty FROM products p LEFT JOIN product_stock ps ON ps.product_id = p.id LEFT JOIN reorder_rules rr ON rr.product_id = p.id GROUP BY p.id, rr.min_qty HAVING COALESCE(SUM(ps.quantity), 0) > 0 AND rr.min_qty IS NOT NULL AND COALESCE(SUM(ps.quantity), 0) <= rr.min_qty) low) AS low_stock_items, 
      (SELECT COUNT(*) FROM (SELECT p.id FROM products p LEFT JOIN product_stock ps ON ps.product_id = p.id GROUP BY p.id HAVING COALESCE(SUM(ps.quantity), 0) <= 0) out) AS out_of_stock_items, 
      (SELECT COUNT(*) FROM receipts WHERE status NOT IN ('DONE', 'CANCELLED')) AS pending_receipts, 
      (SELECT COUNT(*) FROM delivery_orders WHERE status NOT IN ('DONE', 'CANCELLED')) AS pending_deliveries, 
      (SELECT COUNT(*) FROM internal_transfers WHERE status NOT IN ('DONE', 'CANCELLED')) AS internal_transfers_scheduled
  `;
  return (await pool.query(query)).rows[0];
}

export async function listOperations(query = {}) {
  const values = [];
  const requestedTypes = query.docType ? [query.docType.toUpperCase()] : ['RECEIPT', 'DELIVERY', 'INTERNAL', 'ADJUSTMENT'];
  const definitions = {
    RECEIPT: { table: 'receipts', location: 'destination_location_id', lines: 'receipt_lines', lineFk: 'receipt_id' },
    DELIVERY: { table: 'delivery_orders', location: 'source_location_id', lines: 'delivery_order_lines', lineFk: 'delivery_order_id' },
    INTERNAL: { table: 'internal_transfers', location: 'source_location_id', lines: 'internal_transfer_lines', lineFk: 'transfer_id' },
    ADJUSTMENT: { table: 'stock_adjustments', location: 'location_id', lines: 'stock_adjustment_lines', lineFk: 'adjustment_id' },
  };
  const statements = [];
  for (const type of requestedTypes) {
    const definition = definitions[type];
    if (!definition) continue;
    const clauses = [];
    if (query.status) { values.push(query.status); clauses.push(`d.status = $${values.length}`); }
    if (query.warehouseId) { values.push(query.warehouseId); clauses.push(`loc.warehouse_id = $${values.length}`); }
    if (query.categoryId) { values.push(query.categoryId); clauses.push(`EXISTS (SELECT 1 FROM ${definition.lines} dl JOIN products cp ON cp.id = dl.product_id WHERE dl.${definition.lineFk} = d.id AND cp.category_id = $${values.length})`); }
    statements.push(`SELECT d.reference_no, '${type}' AS doc_type, d.status, d.created_at FROM ${definition.table} d JOIN locations loc ON loc.id = d.${definition.location} ${clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''}`);
  }
  if (!statements.length) return [];
  return (await pool.query(`${statements.join(' UNION ALL ')} ORDER BY created_at DESC`, values)).rows;
}
