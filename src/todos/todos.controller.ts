import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Todo } from './entities/todo.entity';
import { PageOptionsDto } from './dto/page-options.dto';
import { TODO_RESPONSES, TodoPageResponse } from './responses/todo.responses';

@ApiTags('todos')
@Controller('todos')
export class TodosController {
    constructor(private readonly todosService: TodosService) { }

    @Post()
    @ApiOperation({ summary: 'Criar uma nova tarefa' })
    @ApiResponse(TODO_RESPONSES.CREATED)
    async create(@Body() createTodoDto: CreateTodoDto): Promise<Todo> {
        return this.todosService.create(createTodoDto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todas as tarefas' })
    @ApiResponse(TODO_RESPONSES.FOUND_ALL)
    findAll(@Query() pageOptionsDto: PageOptionsDto): Promise<TodoPageResponse> {
        return this.todosService.findAll(pageOptionsDto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar uma tarefa específica' })
    @ApiResponse(TODO_RESPONSES.FOUND_ONE)
    @ApiResponse(TODO_RESPONSES.NOT_FOUND)
    async findOne(@Param('id') id: string): Promise<Todo> {
        return this.todosService.findOne(+id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Atualizar uma tarefa' })
    @ApiResponse(TODO_RESPONSES.UPDATED)
    @ApiResponse(TODO_RESPONSES.NOT_FOUND)
    async update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto): Promise<Todo> {
        return this.todosService.update(+id, updateTodoDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Remover uma tarefa' })
    @ApiResponse(TODO_RESPONSES.DELETED)
    @ApiResponse(TODO_RESPONSES.NOT_FOUND)
    async remove(@Param('id') id: string): Promise<void> {
        await this.todosService.remove(+id);
    }
} 