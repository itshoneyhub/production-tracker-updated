const request = require('supertest');
const express = require('express');
const stagesRouter = require('../routes/stages');

// Mock the db module
jest.mock('../db', () => ({
  query: jest.fn()
}));

const { query } = require('../db');

const app = express();
app.use(express.json());
app.use('/stages', stagesRouter);

describe('Stages API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /stages', () => {
    it('should return a list of stages', async () => {
      const mockStages = [{ id: '1', name: 'Stage 1' }];
      query.mockResolvedValue({ rows: mockStages });

      const res = await request(app).get('/stages');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockStages);
    });
  });

  describe('GET /stages/:id', () => {
    it('should return a single stage', async () => {
      const mockStage = { id: '1', name: 'Stage 1' };
      query.mockResolvedValue({ rows: [mockStage] });

      const res = await request(app).get('/stages/1');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockStage);
    });

    it('should return 404 if stage not found', async () => {
      query.mockResolvedValue({ rows: [] });

      const res = await request(app).get('/stages/1');

      expect(res.statusCode).toEqual(404);
    });
  });
});