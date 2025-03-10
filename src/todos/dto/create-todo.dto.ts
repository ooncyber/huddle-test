import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTodoDto {
  @ApiProperty({ description: 'Título da tarefa' })
  @IsNotEmpty()
  @IsString()
  title: string;
} 