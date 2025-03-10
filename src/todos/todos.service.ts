import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './entities/todo.entity';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { PageOptionsDto } from './dto/page-options.dto';
import { TodoPageResponse } from './responses/todo.responses';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private todoRepository: Repository<Todo>,
  ) {}

  create(createTodoDto: CreateTodoDto) {
    const todo = this.todoRepository.create(createTodoDto);
    return this.todoRepository.save(todo);
  }

  async findAll(pageOptionsDto: PageOptionsDto): Promise<TodoPageResponse> {
    const queryBuilder = this.todoRepository.createQueryBuilder('todo');
    
    queryBuilder
      .orderBy('todo.createdAt', pageOptionsDto.order)
      .skip((pageOptionsDto.page - 1) * pageOptionsDto.take)
      .take(pageOptionsDto.take);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      data: items,
      meta: {
        page: pageOptionsDto.page,
        take: pageOptionsDto.take,
        itemCount: items.length,
        pageCount: Math.ceil(total / pageOptionsDto.take),
        hasPreviousPage: pageOptionsDto.page > 1,
        hasNextPage: pageOptionsDto.page < Math.ceil(total / pageOptionsDto.take),
      }
    };
  }

  async findOne(id: number) {
    const todo = await this.todoRepository.findOne({ where: { id } });
    if (!todo) {
      throw new NotFoundException(`Todo #${id} não encontrado`);
    }
    return todo;
  }

  async update(id: number, updateTodoDto: UpdateTodoDto) {
    const todo = await this.findOne(id);
    this.todoRepository.merge(todo, updateTodoDto);
    return this.todoRepository.save(todo);
  }

  async remove(id: number) {
    const todo = await this.findOne(id);
    return this.todoRepository.remove(todo);
  }
} 