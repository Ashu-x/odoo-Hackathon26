import { pool } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { withTransaction } from '../utils/db.js';
import { createReferenceNumber } from '../utils/refNumber.js';
import * as stock from './stock.service.js';

const configs = {
  receipt: { table: 'receipts', linesTable: 'receipt_lines', lineFk: 'receipt_id', referenceType: 'RECEIPT', type: 'receipt' },
  delivery: { table: 'delivery_orders', linesTable: 'delivery_order_lines', lineFk: 'delivery_order_id', referenceType: 'DELIVERY_ORDER', type: 'delivery' },
  transfer: { table: 'internal_transfers', linesTable: 'internal_transfer_lines', lineFk: 'transfer_id', referenceType: 'INTERNAL_TRANSFER', type: 'transfer' },
  adjustment: { table: 'stock_adjustments', linesTable: 'stock_adjustment_lines', lineFk: 'adjustment_id', referenceType: 'STOCK_ADJUSTMENT', type: 'adjustment' },
};

function config(type) { const value = configs[type]; if (!value) throw new ApiError(400, 'Unknown document type'); return value; }
function lineInput(type, line) { if (type === 'adjustment') return [line.productId, line.countedQuantity]; return [line.productId, line.quantity]; }
function lineColumns(type) { return type === 'adjustment' ? '(product_id, counted_quantity)' : '(product_id, quantity)'; }

export async function list(type, query = {}) {
  const c = config(type);
  const values = [];
  const where = [];
  let joinClause = '';

  if (query.status) {
    values.push(query.status);
    where.push(`d.status = $${values.length}`);
  }

  if (query.warehouseId) {
    values.push(query.warehouseId);
    const locationCol = type === 'receipt' ? 'destination_location_id' : (type === 'delivery' || type === 'transfer' ? 'source_location_id' : 'location_id');
    joinClause = `JOIN locations l ON l.id = d.${locationCol}`;
    where.push(`l.warehouse_id = $${values.length}`);
  }

  if (query.categoryId) {
    values.push(query.categoryId);
    where.push(`EXISTS (SELECT 1 FROM ${c.linesTable} dl JOIN products p ON p.id = dl.product_id WHERE dl.${c.lineFk} = d.id AND p.category_id = $${values.length})`);
  }

  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  return (await pool.query(`SELECT d.* FROM ${c.table} d ${joinClause} ${clause} ORDER BY d.created_at DESC`, values)).rows;
}

export async function get(type, id) { const c = config(type); const result = await pool.query(`SELECT * FROM ${c.table} WHERE id = $1`, [id]); if (!result.rows[0]) throw new ApiError(404, 'Document not found'); const lines = await pool.query(`SELECT * FROM ${c.linesTable} WHERE ${c.lineFk} = $1 ORDER BY id`, [id]); return { ...result.rows[0], lines: lines.rows }; }

export async function create(type, input, userId) { const c = config(type); return withTransaction(async client => { const ref = createReferenceNumber(c.type); let headerQuery; let values; if (type === 'receipt') { headerQuery = `INSERT INTO ${c.table} (reference_no, supplier_id, destination_location_id, created_by) VALUES ($1, $2, $3, $4) RETURNING *`; values = [ref, input.supplierId, input.destinationLocationId, userId]; } else if (type === 'delivery') { headerQuery = `INSERT INTO ${c.table} (reference_no, customer_name, source_location_id, created_by) VALUES ($1, $2, $3, $4) RETURNING *`; values = [ref, input.customerName, input.sourceLocationId, userId]; } else if (type === 'transfer') { headerQuery = `INSERT INTO ${c.table} (reference_no, source_location_id, destination_location_id, created_by) VALUES ($1, $2, $3, $4) RETURNING *`; values = [ref, input.sourceLocationId, input.destinationLocationId, userId]; } else { headerQuery = `INSERT INTO ${c.table} (reference_no, location_id, created_by) VALUES ($1, $2, $3) RETURNING *`; values = [ref, input.locationId, userId]; } const header = (await client.query(headerQuery, values)).rows[0]; for (const line of input.lines) { const [productId, quantity] = lineInput(type, line); await client.query(`INSERT INTO ${c.linesTable} (${c.lineFk}, ${lineColumns(type).slice(1, -1)}) VALUES ($1, $2, $3)`, [header.id, productId, quantity]); } return { ...header, lines: input.lines }; }); }

export async function update(type, id, input) { const c = config(type); if (!['receipt', 'delivery'].includes(type)) throw new ApiError(400, 'This document type cannot be updated'); return withTransaction(async client => { const current = (await client.query(`SELECT * FROM ${c.table} WHERE id = $1 FOR UPDATE`, [id])).rows[0]; if (!current) throw new ApiError(404, 'Document not found'); if (current.status !== 'DRAFT') throw new ApiError(409, 'Only draft documents can be edited'); let updated; if (type === 'receipt') updated = (await client.query(`UPDATE ${c.table} SET supplier_id = $1, destination_location_id = $2 WHERE id = $3 RETURNING *`, [input.supplierId, input.destinationLocationId, id])).rows[0]; else updated = (await client.query(`UPDATE ${c.table} SET customer_name = $1, source_location_id = $2 WHERE id = $3 RETURNING *`, [input.customerName, input.sourceLocationId, id])).rows[0]; await client.query(`DELETE FROM ${c.linesTable} WHERE ${c.lineFk} = $1`, [id]); for (const line of input.lines) { const [productId, quantity] = lineInput(type, line); await client.query(`INSERT INTO ${c.linesTable} (${c.lineFk}, ${lineColumns(type).slice(1, -1)}) VALUES ($1, $2, $3)`, [id, productId, quantity]); } return { ...updated, lines: input.lines }; }); }

export async function validate(type, id, userId) {
  const c = config(type);
  return withTransaction(async client => {
    const headerResult = await client.query(`SELECT * FROM ${c.table} WHERE id = $1 FOR UPDATE`, [id]);
    const header = headerResult.rows[0];
    if (!header) throw new ApiError(404, 'Document not found');

    const allowed = type === 'delivery' ? ['READY'] : ['DRAFT'];
    if (!allowed.includes(header.status)) throw new ApiError(409, 'Document cannot be validated from its current status');

    const lines = (await client.query(`SELECT * FROM ${c.linesTable} WHERE ${c.lineFk} = $1`, [id])).rows;
    if (!lines.length) throw new ApiError(400, 'Document has no lines');

    if (type === 'receipt') for (const line of lines) await stock.receive(client, line, header.destination_location_id, userId, id);
    if (type === 'delivery') for (const line of lines) await stock.deliver(client, line, header.source_location_id, userId, id);
    if (type === 'transfer') for (const line of lines) await stock.transfer(client, line, header.source_location_id, header.destination_location_id, userId, id);

    // CAPTURE AND PERSIST THE RECORDED QUANTITY FOR ADJUSTMENTS
    if (type === 'adjustment') {
      for (const line of lines) {
        const adjusted = await stock.adjust(client, line, header.location_id, userId, id);
        await client.query(
          `UPDATE stock_adjustment_lines SET recorded_quantity = $1 WHERE id = $2`,
          [adjusted.recorded_quantity, line.id]
        );
      }
    }

    const updated = (await client.query(`UPDATE ${c.table} SET status = 'DONE', validated_at = NOW() WHERE id = $1 RETURNING *`, [id])).rows[0];
    return { ...updated, lines };
  });
}

export async function transition(type, id, from, to){ 
  const c = config(type); 
  const result = await pool.query(`UPDATE ${c.table} SET status = $1 WHERE id = $2 AND status = $3 RETURNING *`, [to, id, from]); 
  if (!result.rows[0]) throw new ApiError(409, `Document must be ${from} before it can become ${to}`); 
  return result.rows[0]; 
}
export async function cancel(type, id) { const c = config(type); const result = await pool.query(`UPDATE ${c.table} SET status = 'CANCELLED' WHERE id = $1 AND status NOT IN ('DONE', 'CANCELLED') RETURNING *`, [id]); if (!result.rows[0]) throw new ApiError(409, 'Document cannot be cancelled'); return result.rows[0]; }
