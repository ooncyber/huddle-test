import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { Order } from '../src/todos/dto/page-options.dto';
import { Todo } from '../src/todos/entities/todo.entity';
import { TodosService } from '../src/todos/todos.service';

describe('TodosService', () => {
  let service: TodosService;
  let repository: Repository<Todo>;

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
    jest.clearAllMocks();
    mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: getRepositoryToken(Todo),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TodosService>(TodosService);
    repository = module.get<Repository<Todo>>(getRepositoryToken(Todo));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a todo', async () => {
      const createTodoDto = { title: 'Test Todo' };
      const todo = { id: 1, ...createTodoDto, completed: false };

      mockRepository.create.mockReturnValue(todo);
      mockRepository.save.mockResolvedValue(todo);

      const result = await service.create(createTodoDto);
      expect(result).toEqual(todo);
    });

    it('should handle validation errors', async () => {
      const createTodoDto = { title: '' };
      mockRepository.create.mockReturnValue({ id: 1, ...createTodoDto });
      mockRepository.save.mockRejectedValue(new Error('Validation error'));

      await expect(service.create(createTodoDto)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return paginated todos', async () => {
      const todos = [{ id: 1, title: 'Test Todo', completed: false }];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([todos, 1]);

      const result = await service.findAll({ page: 1, take: 10, order: Order.ASC });
      expect(result.data).toEqual(todos);
      expect(result.meta.itemCount).toBe(1);
    });

    it('should handle empty results', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll({ page: 1, take: 10, order: Order.ASC });
      expect(result.data).toEqual([]);
      expect(result.meta.itemCount).toBe(0);
      expect(result.meta.hasNextPage).toBe(false);
    });

    it('should calculate pagination metadata correctly', async () => {
      const todos = Array(15).fill({ id: 1, title: 'Test Todo', completed: false });
      mockQueryBuilder.getManyAndCount.mockResolvedValue([todos.slice(0, 10), 15]);

      const result = await service.findAll({ page: 1, take: 10, order: Order.ASC });
      expect(result.meta.pageCount).toBe(2);
      expect(result.meta.hasNextPage).toBe(true);
      expect(result.meta.hasPreviousPage).toBe(false);
    });
  });

  describe('findOne', () => {
    it('should return a todo', async () => {
      const todo = { id: 1, title: 'Test Todo', completed: false };
      mockRepository.findOne.mockResolvedValue(todo);

      const result = await service.findOne(1);
      expect(result).toEqual(todo);
    });

    it('should throw NotFoundException when todo not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a todo', async () => {
      const todo = { id: 1, title: 'Test Todo', completed: false };
      const updateDto = { title: 'Updated Todo', completed: true };
      const updatedTodo = { ...todo, ...updateDto };
      
      mockRepository.findOne.mockResolvedValue(todo);
      mockRepository.merge.mockReturnValue(updatedTodo);
      mockRepository.save.mockResolvedValue(updatedTodo);

      const result = await service.update(1, updateDto);
      expect(result.title).toBe(updateDto.title);
      expect(result.completed).toBe(updateDto.completed);
    });

    it('should throw NotFoundException when updating non-existent todo', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(1, { title: 'Updated' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a todo', async () => {
      const todo = { id: 1, title: 'Test Todo', completed: false };
      mockRepository.findOne.mockResolvedValue(todo);
      mockRepository.remove.mockResolvedValue(todo);

      const result = await service.remove(1);
      expect(result).toEqual(todo);
    });

    it('should throw NotFoundException when removing non-existent todo', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
}); 