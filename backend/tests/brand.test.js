const request = require('supertest');
const db      = require('../db');

jest.mock('../db', () => ({ query: jest.fn() }));

const app = require('../app');

const MOCK_BRAND = {
  id: 1, name: 'Re:flect',
  tagline: 'Second Life. First Impact.',
  about: 'Re:flect — бренд з переробки.',
};

describe('GET /api/brand', () => {
  beforeEach(() => {
    db.query
      .mockResolvedValueOnce({ rows: [MOCK_BRAND] })                       // brand_info
      .mockResolvedValueOnce({ rows: [{ id: 1, name: 'Coral Wave', hex: '#FE6077', label: 'Акцент' }] }) // colors
      .mockResolvedValueOnce({ rows: [{ id: 1, name: 'Proxima Nova', weight: 'Extrabold', usage: 'Заголовки' }] }) // fonts
      .mockResolvedValueOnce({ rows: [{ id: 1, title: 'Hang Tags', image_path: 'images/tags.png', category: 'print' }] }) // mockups
      .mockResolvedValueOnce({ rows: [{ id: 1, text: 'Second Life.', is_active: 1 }] }); // slogans
  });

  it('returns all brand data in one response', async () => {
    const res = await request(app).get('/api/brand');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('info');
    expect(res.body).toHaveProperty('colors');
    expect(res.body).toHaveProperty('fonts');
    expect(res.body).toHaveProperty('mockups');
    expect(res.body).toHaveProperty('slogans');
  });

  it('info contains correct brand name', async () => {
    const res = await request(app).get('/api/brand');

    expect(res.body.info.name).toBe('Re:flect');
    expect(res.body.info.tagline).toBe('Second Life. First Impact.');
  });

  it('colors is an array', async () => {
    const res = await request(app).get('/api/brand');

    expect(Array.isArray(res.body.colors)).toBe(true);
    expect(res.body.colors[0]).toHaveProperty('hex');
  });
});

describe('PUT /api/brand', () => {
  it('updates brand info with valid data', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 1 });

    const res = await request(app)
      .put('/api/brand')
      .send({ name: 'Re:flect', tagline: 'New Tagline', about: 'New about text' });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('returns 400 when name is missing', async () => {
    const res = await request(app)
      .put('/api/brand')
      .send({ tagline: 'No name here' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
