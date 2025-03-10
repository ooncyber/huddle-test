import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Todo } from '../../src/todos/entities/todo.entity';

describe('TodosController (e2e)', () => {
  let app: INestApplication;
  
  const mockQueryBuilder = {
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
    merge: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  beforeEach(async () => {
    // Reset dos mocks
    jest.clearAllMocks();
    mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(getRepositoryToken(Todo))
    .useValue(mockRepository)
    .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/todos (POST)', () => {
    it('should create a todo', () => {
      const todo = { title: 'Test Todo' };
      mockRepository.create.mockReturnValue({ id: 1, ...todo, completed: false });
      mockRepository.save.mockResolvedValue({ id: 1, ...todo, completed: false });

      return request(app.getHttpServer())
        .post('/todos')
        .send(todo)
        .expect(201)
        .expect(res => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe(todo.title);
        });
    });

    it('should validate empty title', () => {
      return request(app.getHttpServer())
        .post('/todos')
        .send({ title: '' })
        .expect(400);
    });

   
  });

  describe('/todos (GET)', () => {
    it('should return paginated todos', () => {
      const todos = [{ id: 1, title: 'Test Todo', completed: false }];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([todos, 1]);

      return request(app.getHttpServer())
        .get('/todos')
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should handle pagination parameters', () => {
      const todos = Array(15).fill({ id: 1, title: 'Test Todo', completed: false });
      mockQueryBuilder.getManyAndCount.mockResolvedValue([todos.slice(10, 15), 15]);

      return request(app.getHttpServer())
        .get('/todos?page=2&take=10')
        .expect(200)
        .expect(res => {
          expect(res.body.meta.page).toBe(2);
          expect(res.body.meta.take).toBe(10);
          expect(res.body.meta.hasNextPage).toBe(false);
          expect(res.body.meta.hasPreviousPage).toBe(true);
        });
    });

    it('should handle invalid pagination parameters', () => {
      return request(app.getHttpServer())
        .get('/todos?page=invalid')
        .expect(400);
    });
  });

  describe('/todos/:id (GET)', () => {
    it('should return a todo', () => {
      const todo = { id: 1, title: 'Test Todo', completed: false };
      mockRepository.findOne.mockResolvedValue(todo);

      return request(app.getHttpServer())
        .get('/todos/1')
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('id', 1);
          expect(res.body.title).toBe(todo.title);
        });
    });

    it('should return 404 when todo not found', () => {
      mockRepository.findOne.mockResolvedValue(null);

      return request(app.getHttpServer())
        .get('/todos/1')
        .expect(404);
    });
  });

  describe('/todos/:id (PATCH)', () => {
    it('should update a todo', () => {
      const todo = { id: 1, title: 'Test Todo', completed: false };
      const updateData = { completed: true };
      const updatedTodo = { ...todo, ...updateData };
      
      mockRepository.findOne.mockResolvedValue(todo);
      mockRepository.merge.mockReturnValue(updatedTodo);
      mockRepository.save.mockResolvedValue(updatedTodo);

      return request(app.getHttpServer())
        .patch('/todos/1')
        .send(updateData)
        .expect(200)
        .expect(res => {
          expect(res.body.completed).toBe(true);
        });
    });

    it('should validate update data', () => {
      return request(app.getHttpServer())
        .patch('/todos/1')
        .send({ completed: 'invalid' })
        .expect(400);
    });

    it('should handle non-existent todo on update', () => {
      mockRepository.findOne.mockResolvedValue(null);

      return request(app.getHttpServer())
        .patch('/todos/1')
        .send({ completed: true })
        .expect(404);
    });
  });

  describe('/todos/:id (DELETE)', () => {
    it('should delete a todo', () => {
      const todo = { id: 1, title: 'Test Todo', completed: false };
      mockRepository.findOne.mockResolvedValue(todo);
      mockRepository.remove.mockResolvedValue(todo);

      return request(app.getHttpServer())
        .delete('/todos/1')
        .expect(200);
    });

    it('should handle non-existent todo on delete', () => {
      mockRepository.findOne.mockResolvedValue(null);

      return request(app.getHttpServer())
        .delete('/todos/1')
        .expect(404);
    });
  });
}); 