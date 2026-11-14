const test = require('node:test');
const assert = require('node:assert/strict');

const baseUrl = process.env.API_URL || 'http://127.0.0.1:3000/api';
const managerEmail = process.env.MANAGER_EMAIL || 'manager@shop.com';
const managerPassword = process.env.MANAGER_PASSWORD || 'Manager@123';

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  let body = null;
  try { body = await response.json(); } catch { /* empty response */ }
  return { response, body };
}

test('health endpoint responds successfully', async () => {
  const { response, body } = await request('/health');
  assert.equal(response.status, 200);
  assert.deepEqual(body, { status: 'ok' });
});

test('public catalog endpoints respond successfully', async () => {
  const categories = await request('/categories');
  const items = await request('/items');
  assert.equal(categories.response.status, 200);
  assert.ok(Array.isArray(categories.body));
  assert.equal(items.response.status, 200);
  assert.ok(Array.isArray(items.body));
});

test('invalid order and checkout payloads are rejected', async () => {
  const payload = {
    customer: { name: 'API Test', phone: '01000000000', email: 'api@example.com' },
    items: [],
  };
  const order = await request('/orders', { method: 'POST', body: JSON.stringify(payload) });
  const checkout = await request('/payments/create-checkout-session', { method: 'POST', body: JSON.stringify(payload) });
  assert.equal(order.response.status, 400);
  assert.equal(checkout.response.status, 400);
});

test('admin endpoints require authentication', async () => {
  const { response } = await request('/admin/items');
  assert.equal(response.status, 401);
});

test('manager can log in and access admin endpoints', async () => {
  const login = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: managerEmail, password: managerPassword }),
  });
  assert.equal(login.response.status, 200);
  assert.ok(login.body.token);

  const adminItems = await request('/admin/items', {
    headers: { authorization: `Bearer ${login.body.token}` },
  });
  const adminOrders = await request('/admin/orders', {
    headers: { authorization: `Bearer ${login.body.token}` },
  });
  assert.equal(adminItems.response.status, 200);
  assert.ok(Array.isArray(adminItems.body));
  assert.equal(adminOrders.response.status, 200);
  assert.ok(Array.isArray(adminOrders.body));
});

test('invalid login is rejected', async () => {
  const { response } = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: managerEmail, password: 'wrong-password' }),
  });
  assert.equal(response.status, 401);
});
