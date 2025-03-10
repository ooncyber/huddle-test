import { Type } from '@nestjs/common';

export interface ApiResponseOptions {
  description: string;
  type?: Type<any> | Function;
  isArray?: boolean;
}

export const CREATED = (options: ApiResponseOptions) => ({
  status: 201,
  description: options.description,
  type: options.type
});

export const OK = (options: ApiResponseOptions) => ({
  status: 200,
  description: options.description,
  type: options.type,
  isArray: options.isArray
});

export const NO_CONTENT = {
  status: 204,
  description: 'Operação realizada com sucesso'
};

export const NOT_FOUND = {
  status: 404,
  description: 'Recurso não encontrado'
}; 