const request = require('supertest');

// мокаємо базу даних — тести не потребують реального PostgreSQL
jest.mock('../db', () => ({
  query: jest.fn(),
}));

const app = require('../app');

describe('POST /api/auth/login', () => {
  it('returns 200 and token with correct password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'reflect2025' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
    expect(res.body.token.length).toBeGreaterThan(10);
  });

  it('returns 401 with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 401 with empty body', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/check', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'reflect2025' });
    token = res.body.token;
  });

  it('returns 200 with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/check')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/auth/check');
    expect(res.status).toBe(401);
  });

  it('returns 401 with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/check')
      .set('Authorization', 'Bearer invalidtoken123');

    expect(res.status).toBe(401);
  });
});
