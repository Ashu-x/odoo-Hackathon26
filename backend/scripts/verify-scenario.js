import { app } from '../src/app.js';
import { pool } from '../src/config/db.js';

const server = app.listen(0, async () => {
  try {
    const base = `http://127.0.0.1:${server.address().port}/api`;
    const request = async (path, options = {}) => {
      const config = { method: options.method || 'GET', headers: { 'content-type': 'application/json' } };
      if (options.token) config.headers.authorization = `Bearer ${options.token}`;
      if (options.body) config.body = JSON.stringify(options.body);
      const response = await fetch(base + path, config);
      const body = await response.json();
      if (!response.ok) throw new Error(`${path} ${response.status} ${JSON.stringify(body)}`);
      return body.data;
    };

    const user = (await pool.query('SELECT email FROM users ORDER BY created_at DESC LIMIT 1')).rows[0];
    const auth = await request('/auth/login', { method: 'POST', body: { email: user.email, password: 'scenario-password' } });
    const token = auth.token;
    const locations = (await pool.query('SELECT id, name FROM locations ORDER BY created_at DESC LIMIT 2')).rows;
    const products = (await pool.query('SELECT id, name FROM products ORDER BY created_at DESC LIMIT 2')).rows;
    const main = locations.find(row => row.name === 'Main Store');
    const rack = locations.find(row => row.name === 'Production Rack');
    const steel = products.find(row => row.name.startsWith('Steel'));
    const finished = products.find(row => row.name.startsWith('Finished Goods'));

    await pool.query('INSERT INTO product_stock (product_id, location_id, quantity) VALUES ($1, $2, $3) ON CONFLICT (product_id, location_id) DO UPDATE SET quantity = EXCLUDED.quantity', [finished.id, main.id, 20]);
    const supplier = (await pool.query('INSERT INTO suppliers (name) VALUES ($1) RETURNING id', ['Scenario Supplier ' + Date.now()])).rows[0];

    const receipt = await request('/receipts', { method: 'POST', token, body: { supplierId: supplier.id, destinationLocationId: main.id, lines: [{ productId: steel.id, quantity: 100 }] } });
    await request(`/receipts/${receipt.id}/validate`, { method: 'POST', token, body: {} });

    const transfer = await request('/internal-transfers', { method: 'POST', token, body: { sourceLocationId: main.id, destinationLocationId: rack.id, lines: [{ productId: steel.id, quantity: 100 }] } });
    await request(`/internal-transfers/${transfer.id}/validate`, { method: 'POST', token, body: {} });

    const delivery = await request('/delivery-orders', { method: 'POST', token, body: { customerName: 'Scenario Customer', sourceLocationId: main.id, lines: [{ productId: finished.id, quantity: 20 }] } });
    await request(`/delivery-orders/${delivery.id}/pick`, { method: 'POST', token, body: {} });
    await request(`/delivery-orders/${delivery.id}/pack`, { method: 'POST', token, body: {} });
    await request(`/delivery-orders/${delivery.id}/validate`, { method: 'POST', token, body: {} });

    const adjustment = await request('/stock-adjustments', { method: 'POST', token, body: { locationId: rack.id, lines: [{ productId: steel.id, countedQuantity: 97 }] } });
    await request(`/stock-adjustments/${adjustment.id}/validate`, { method: 'POST', token, body: {} });

    const stock = (await pool.query('SELECT product_id, location_id, quantity FROM product_stock WHERE product_id IN ($1, $2) ORDER BY product_id, location_id', [steel.id, finished.id])).rows;
    const moves = await request('/stock-moves', { token });
    const ids = [receipt.id, transfer.id, delivery.id, adjustment.id];
    const movementTypes = moves.filter(move => ids.includes(move.reference_id)).map(move => move.move_type).sort();
    console.log(JSON.stringify({ stock, movementTypes, moveCount: movementTypes.length }, null, 2));
  } catch (error) {
    console.error('scenario failed:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
    server.close();
  }
});
