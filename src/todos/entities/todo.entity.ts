import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Todo {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'ID único do todo' })
  id: number;

  @Column()
  @ApiProperty({ description: 'Título da tarefa' })
  title: string;

  @Column({ default: false })
  @ApiProperty({ description: 'Status de conclusão da tarefa' })
  completed: boolean;

  @CreateDateColumn()
  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Data da última atualização' })
  updatedAt: Date;
} 