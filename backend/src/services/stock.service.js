import { ApiError } from '../utils/ApiError.js';

export async function changeStock(client, { productId, locationId, delta, userId, moveType, referenceType, referenceId, fromLocationId = null, toLocationId = null, recordMove = true }) {
  const lock = await client.query(`
    INSERT INTO product_stock (product_id, location_id, quantity) 
    VALUES ($1, $2, 0) 
    ON CONFLICT (product_id, location_id) 
    DO UPDATE SET quantity = product_stock.quantity 
    RETURNING quantity
  `, [productId, locationId]);

  const current = Number(lock.rows[0].quantity);
  const next = current + Number(delta);

  if (next < 0) {
    throw new ApiError(400, 'Insufficient stock', { productId, locationId, available: current, requested: Math.abs(Number(delta)) });
  }

  await client.query('UPDATE product_stock SET quantity = $1 WHERE product_id = $2 AND location_id = $3', [next, productId, locationId]);

  if (recordMove && Number(delta) !== 0) {
    await client.query('INSERT INTO stock_moves (product_id, from_location_id, to_location_id, quantity, move_type, reference_type, reference_id, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [productId, fromLocationId, toLocationId, Math.abs(Number(delta)), moveType, referenceType, referenceId, userId]);
  }
}

export async function receive(client, line, locationId, userId, referenceId) {
  return changeStock(client, { productId: line.product_id, locationId, delta: line.quantity, userId, moveType: 'RECEIPT', referenceType: 'RECEIPT', referenceId, toLocationId: locationId });
}

export async function deliver(client, line, locationId, userId, referenceId) {
  return changeStock(client, { productId: line.product_id, locationId, delta: -Number(line.quantity), userId, moveType: 'DELIVERY', referenceType: 'DELIVERY_ORDER', referenceId, fromLocationId: locationId });
}

export async function transfer(client, line, sourceLocationId, destinationLocationId, userId, referenceId) {
  await changeStock(client, { productId: line.product_id, locationId: sourceLocationId, delta: -Number(line.quantity), userId, moveType: 'INTERNAL_TRANSFER', referenceType: 'INTERNAL_TRANSFER', referenceId, recordMove: false });
  await changeStock(client, { productId: line.product_id, locationId: destinationLocationId, delta: Number(line.quantity), userId, moveType: 'INTERNAL_TRANSFER', referenceType: 'INTERNAL_TRANSFER', referenceId, recordMove: false });
  await client.query("INSERT INTO stock_moves (product_id, from_location_id, to_location_id, quantity, move_type, reference_type, reference_id, created_by) VALUES ($1, $2, $3, $4, 'INTERNAL_TRANSFER', 'INTERNAL_TRANSFER', $5, $6)", [line.product_id, sourceLocationId, destinationLocationId, line.quantity, referenceId, userId]);
}

export async function adjust(client, line, locationId, userId, referenceId) {
  const lock = await client.query(`
    INSERT INTO product_stock (product_id, location_id, quantity) 
    VALUES ($1, $2, 0) 
    ON CONFLICT (product_id, location_id) 
    DO UPDATE SET quantity = product_stock.quantity 
    RETURNING quantity
  `, [line.product_id, locationId]);

  const recorded = Number(lock.rows[0].quantity);
  const counted = Number(line.counted_quantity);
  const diff = counted - recorded;

  await changeStock(client, { productId: line.product_id, locationId, delta: diff, userId, moveType: 'ADJUSTMENT', referenceType: 'STOCK_ADJUSTMENT', referenceId, fromLocationId: diff < 0 ? locationId : null, toLocationId: diff > 0 ? locationId : null });

  return { ...line, recorded_quantity: recorded, difference: diff };
}