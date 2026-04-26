const request = require('supertest');
const app = require('../src/app');

describe('Health Endpoint', () => {
  it('should return ok status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('version');
  });
});

describe('AI Routes', () => {
  it('should return 404 for non-existent AI route', async () => {
    const response = await request(app).post('/ai/nonexistent');
    expect(response.status).toBe(404);
  });
});
