const request = require('supertest');
const db      = require('../db');

jest.mock('../db', () => ({ query: jest.fn() }));

const app = require('../app');

const MOCK_ORDER = {
  id: 1, name: 'Олена', email: 'olena@test.com', phone: '+380501234567',
  material_description: 'Рекламний банер 3x6м', product_type: 'bag',
  quantity: 1, notes: null, status: 'pending',
  created_at: new Date().toISOString(),
};

describe('GET /api/orders', () => {
  it('returns list of orders', async () => {
    db.query.mockResolvedValueOnce({ rows: [MOCK_ORDER] });

    const res = await request(app).get('/api/orders');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('name');
    expect(res.body[0]).toHaveProperty('status');
  });

  it('supports ?status filter', async () => {
    db.query.mockResolvedValueOnce({ rows: [MOCK_ORDER] });

    const res = await request(app).get('/api/orders?status=pending');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/orders/stats', () => {
  it('returns stats object with all counters', async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ total: '5', pending: '2', confirmed: '1', in_progress: '1', done: '1', rejected: '0' }]
    });

    const res = await request(app).get('/api/orders/stats');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('pending');
    expect(res.body).toHaveProperty('done');
    expect(res.body).toHaveProperty('rejected');
  });
});

describe('POST /api/orders', () => {
  it('creates order with valid data', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

    const res = await request(app)
      .post('/api/orders')
      .send({
        name: 'Олена', email: 'olena@test.com',
        material_description: 'Банер 3x6м', product_type: 'bag',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('message');
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ name: 'Олена' }); // без email і product_type

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ name: 'Олена', material_description: 'Банер', product_type: 'bag' });

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/orders/:id', () => {
  it('updates status with valid value', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 1 });

    const res = await request(app)
      .put('/api/orders/1')
      .send({ status: 'confirmed' });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('returns 400 for invalid status', async () => {
    const res = await request(app)
      .put('/api/orders/1')
      .send({ status: 'unknown_status' });

    expect(res.status).toBe(400);
  });

  it('returns 404 when order not found', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 0 });

    const res = await request(app)
      .put('/api/orders/999')
      .send({ status: 'done' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/orders/:id', () => {
  it('deletes existing order', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 1 });

    const res = await request(app).delete('/api/orders/1');

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('returns 404 when order not found', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 0 });

    const res = await request(app).delete('/api/orders/999');

    expect(res.status).toBe(404);
  });
});
