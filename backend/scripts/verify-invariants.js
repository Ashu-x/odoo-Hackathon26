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
      return { status: response.status, body };
    };

    const user = (await pool.query('SELECT email FROM users ORDER BY created_at DESC LIMIT 1')).rows[0];
    const login = await request('/auth/login', { method: 'POST', body: { email: user.email, password: 'scenario-password' } });
    const token = login.body.data.token;
    const receipt = (await pool.query("SELECT id FROM receipts ORDER BY created_at DESC LIMIT 1")).rows[0];
    const repeated = await request(`/receipts/${receipt.id}/validate`, { method: 'POST', token, body: {} });
    const location = (await pool.query("SELECT id FROM locations WHERE name = 'Main Store' ORDER BY created_at DESC LIMIT 1")).rows[0];
    const product = (await pool.query('SELECT id FROM products ORDER BY created_at DESC LIMIT 1')).rows[0];
    const before = (await pool.query('SELECT quantity FROM product_stock WHERE product_id = $1 AND location_id = $2', [product.id, location.id])).rows[0]?.quantity || '0';
    const delivery = await request('/delivery-orders', { method: 'POST', token, body: { customerName: 'Rollback Test', sourceLocationId: location.id, lines: [{ productId: product.id, quantity: 999999 }] } });
    const deliveryId = delivery.body.data.id;
    await request(`/delivery-orders/${deliveryId}/pick`, { method: 'POST', token, body: {} });
    await request(`/delivery-orders/${deliveryId}/pack`, { method: 'POST', token, body: {} });
    const insufficient = await request(`/delivery-orders/${deliveryId}/validate`, { method: 'POST', token, body: {} });
    const after = (await pool.query('SELECT quantity FROM product_stock WHERE product_id = $1 AND location_id = $2', [product.id, location.id])).rows[0]?.quantity || '0';
    console.log(JSON.stringify({ repeatedValidationStatus: repeated.status, insufficientDeliveryStatus: insufficient.status, stockUnchanged: before === after }, null, 2));
  } catch (error) {
    console.error('invariant check failed:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
    server.close();
  }
});
