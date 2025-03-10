import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateTodoDto {
  @ApiProperty({ description: 'Título da tarefa', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Status de conclusão da tarefa', required: false })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
} 