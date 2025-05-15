import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Opinion } from '../opinions/opinion.entity';
import { Roster } from 'src/roster/roster.entity';

@Entity('comments')
export class Comments {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  text: string;

  @CreateDateColumn()
  created: Date;

  @ManyToOne(() => User, (user) => user.comments, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  owner: User;

  @ManyToOne(() => Opinion, (opinion) => opinion.comments, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'opinion_id' })
  opinion: Opinion;

  @ManyToOne(() => Roster, (roster) => roster.comments, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roster_id' })
  roster: Roster;
}