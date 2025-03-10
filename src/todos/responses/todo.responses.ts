import { Todo } from '../entities/todo.entity';
import { CREATED, OK, NO_CONTENT, NOT_FOUND } from '../../common/responses/api-responses';

export class TodoPageMeta { // seria mais abstraído caso tivesse mais elementos além do Todo
  page: number;
  take: number;
  itemCount: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export class TodoPageResponse {
  data: Todo[];
  meta: TodoPageMeta;
}

export const TODO_RESPONSES = {
  CREATED: CREATED({
    description: 'Tarefa criada com sucesso',
    type: Todo
  }),
  
  FOUND_ONE: OK({
    description: 'Tarefa encontrada com sucesso',
    type: Todo
  }),
  
  FOUND_ALL: OK({
    description: 'Lista de tarefas retornada com sucesso',
    type: TodoPageResponse
  }),
  
  UPDATED: OK({
    description: 'Tarefa atualizada com sucesso',
    type: Todo
  }),
  
  DELETED: NO_CONTENT,
  
  NOT_FOUND: NOT_FOUND
}; 