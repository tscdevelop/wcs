import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('s_log')
export class Log {
  @PrimaryGeneratedColumn()
  log_id: number;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ nullable: true })
  username: string;
  
  @Column()
  level: string;

  @Column({ nullable: true })
  operation: string;

  @Column('text')
  message: string;
}
