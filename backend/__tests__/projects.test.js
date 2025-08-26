const request = require('supertest');
const express = require('express');
const projectsRouter = require('../routes/projects');

// Mock the db module
jest.mock('../db', () => ({
  query: jest.fn()
}));

const { query } = require('../db');

const app = express();
app.use(express.json());
app.use('/projects', projectsRouter);

describe('Projects API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /projects', () => {
    it('should return a list of projects', async () => {
      const mockProjects = [{ id: '1', name: 'Project 1' }];
      query.mockResolvedValue({ rows: mockProjects });

      const res = await request(app).get('/projects');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockProjects);
    });
  });

  describe('GET /projects/:id', () => {
    it('should return a single project', async () => {
      const mockProject = { id: '1', name: 'Project 1' };
      query.mockResolvedValue({ rows: [mockProject] });

      const res = await request(app).get('/projects/1');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockProject);
    });

    it('should return 404 if project not found', async () => {
      query.mockResolvedValue({ rows: [] });

      const res = await request(app).get('/projects/1');

      expect(res.statusCode).toEqual(404);
    });
  });
});