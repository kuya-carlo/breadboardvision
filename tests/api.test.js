const request = require('supertest');
const app = require('../index');
const { db, initDb } = require('../db/init');

beforeAll(async () => {
  await initDb();
});

afterAll((done) => {
  db.close(done);
});

describe('API Tests', () => {
  // Test 1: Health check
  test('GET /health returns 200', async () => {
    const response = await request(app).get('/health');
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.database).toBe('connected');
  });

  // Test 2: Netlist parser analysis works
  test('POST /api/analyze/netlist returns success analysis structure', async () => {
    const response = await request(app)
      .post('/api/analyze/netlist')
      .send({
        sessionId: 'test-session-1234',
        netlist: 'Battery 9V (Pos: pinA, Neg: pinB)\nResistor 1k (Pin1: pinA, Pin2: pinC)\nLED (Anode: pinB, Cathode: pinC)'
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.submissionId).toBeDefined();
    expect(response.body.analysis).toBeDefined();
    expect(response.body.analysis.status).toBeDefined();
    expect(response.body.analysis.detectedComponents.some(c => c.toLowerCase().includes('battery'))).toBe(true);
  });

  // Test 3: Validation and Error Handling
  test('Invalid input returns 400 Bad Request', async () => {
    const response = await request(app)
      .post('/api/analyze/netlist')
      .send({
        // Missing netlist
        sessionId: 'test-session-1234'
      });

    expect(response.statusCode).toBe(400);
  });
});
