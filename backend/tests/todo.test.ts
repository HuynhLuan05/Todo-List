import request from 'supertest';
import app from '../src/app';
import prisma from '../src/services/db';

describe('Todo API Endpoints', () => {
  // Clear the database before each test to ensure a clean state
  beforeEach(async () => {
    await prisma.todo.deleteMany({});
  });

  // Disconnect prisma client after all tests
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /health', () => {
    it('should return 200 and healthy status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'healthy');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  describe('POST /api/v1/todos', () => {
    it('should create a new todo with valid data', async () => {
      const todoData = {
        title: 'Học React 19',
        description: 'Xem các tính năng mới của React 19',
        dueDate: new Date(Date.now() + 86400000).toISOString(), // 1 day later
      };

      const res = await request(app)
        .post('/api/v1/todos')
        .send(todoData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.title).toBe(todoData.title);
      expect(res.body.data.description).toBe(todoData.description);
      expect(res.body.data.status).toBe('pending');
      expect(new Date(res.body.data.dueDate).toISOString()).toBe(todoData.dueDate);
    });

    it('should return 400 Bad Request if title is missing', async () => {
      const res = await request(app)
        .post('/api/v1/todos')
        .send({ description: 'Thiếu title' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].message).toContain('Tiêu đề công việc là bắt buộc');
    });

    it('should return 400 Bad Request if title is empty string', async () => {
      const res = await request(app)
        .post('/api/v1/todos')
        .send({ title: '   ' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].message).toContain('Tiêu đề không được để trống');
    });
  });

  describe('GET /api/v1/todos', () => {
    it('should return empty list if no todos exist', async () => {
      const res = await request(app).get('/api/v1/todos');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
      expect(res.body.pagination.totalCount).toBe(0);
    });

    it('should retrieve list of todos with search and filter', async () => {
      // Seed some todos
      await prisma.todo.create({
        data: { title: 'Làm bài test React', description: 'Viết code UI', status: 'completed' },
      });
      await prisma.todo.create({
        data: { title: 'Làm bài test Node', description: 'Viết code Express', status: 'pending' },
      });

      // Filter status=pending
      const resFilter = await request(app)
        .get('/api/v1/todos')
        .query({ status: 'pending' });

      expect(resFilter.status).toBe(200);
      expect(resFilter.body.data.length).toBe(1);
      expect(resFilter.body.data[0].title).toBe('Làm bài test Node');

      // Search term
      const resSearch = await request(app)
        .get('/api/v1/todos')
        .query({ search: 'React' });

      expect(resSearch.status).toBe(200);
      expect(resSearch.body.data.length).toBe(1);
      expect(resSearch.body.data[0].title).toBe('Làm bài test React');
    });
  });

  describe('GET /api/v1/todos/:id', () => {
    it('should return todo detail if exists', async () => {
      const todo = await prisma.todo.create({
        data: { title: 'Test chi tiết' },
      });

      const res = await request(app).get(`/api/v1/todos/${todo.id}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Test chi tiết');
    });

    it('should return 404 if todo does not exist', async () => {
      const res = await request(app).get('/api/v1/todos/non-existing-id');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/todos/:id', () => {
    it('should update todo fields successfully', async () => {
      const todo = await prisma.todo.create({
        data: { title: 'Todo cũ', description: 'Mô tả cũ', status: 'pending' },
      });

      const res = await request(app)
        .put(`/api/v1/todos/${todo.id}`)
        .send({
          title: 'Todo mới',
          status: 'completed',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Todo mới');
      expect(res.body.data.status).toBe('completed');
      expect(res.body.data.description).toBe('Mô tả cũ'); // untouched field remains same
    });
  });

  describe('PATCH /api/v1/todos/:id/toggle', () => {
    it('should toggle status pending -> completed', async () => {
      const todo = await prisma.todo.create({
        data: { title: 'Học bài', status: 'pending' },
      });

      const res = await request(app).patch(`/api/v1/todos/${todo.id}/toggle`);
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('completed');
    });
  });

  describe('DELETE /api/v1/todos/:id', () => {
    it('should delete todo and return 200', async () => {
      const todo = await prisma.todo.create({
        data: { title: 'Cần xóa' },
      });

      const res = await request(app).delete(`/api/v1/todos/${todo.id}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const dbCheck = await prisma.todo.findUnique({ where: { id: todo.id } });
      expect(dbCheck).toBeNull();
    });
  });
});
