const request = require('supertest');
const db      = require('../db');

jest.mock('../db', () => ({ query: jest.fn() }));

const app = require('../app');

const MOCK_COLOR = { id: 1, name: 'Coral Wave', hex: '#FE6077', label: 'Основний акцент' };

describe('GET /api/colors', () => {
  it('returns list of colors', async () => {
    db.query.mockResolvedValueOnce({ rows: [MOCK_COLOR] });

    const res = await request(app).get('/api/colors');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('hex');
  });
});

describe('GET /api/colors/:id', () => {
  it('returns single color by id', async () => {
    db.query.mockResolvedValueOnce({ rows: [MOCK_COLOR] });

    const res = await request(app).get('/api/colors/1');

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Coral Wave');
    expect(res.body.hex).toBe('#FE6077');
  });

  it('returns 404 for non-existent color', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/colors/999');

    expect(res.status).toBe(404);
  });
});

describe('POST /api/colors', () => {
  it('creates color with valid data', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 5 }] });

    const res = await request(app)
      .post('/api/colors')
      .send({ name: 'New Color', hex: '#AABBCC', label: 'Test' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('returns 400 when name is missing', async () => {
    const res = await request(app)
      .post('/api/colors')
      .send({ hex: '#AABBCC' });

    expect(res.status).toBe(400);
  });

  it('returns 400 when hex is missing', async () => {
    const res = await request(app)
      .post('/api/colors')
      .send({ name: 'New Color' });

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/colors/:id', () => {
  it('updates existing color', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 1 });

    const res = await request(app)
      .put('/api/colors/1')
      .send({ name: 'Updated', hex: '#112233', label: 'Updated label' });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('returns 404 for non-existent color', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 0 });

    const res = await request(app)
      .put('/api/colors/999')
      .send({ name: 'X', hex: '#000000' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/colors/:id', () => {
  it('deletes existing color', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 1 });

    const res = await request(app).delete('/api/colors/1');

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('returns 404 for non-existent color', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 0 });

    const res = await request(app).delete('/api/colors/999');

    expect(res.status).toBe(404);
  });
});
