import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Comment } from '../comments/comment.entity'; // Adjust the path to your Comment entity
import { User } from 'src/users/user.entity';

@Entity('opinions')
export class Opinion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  title: string;

  @OneToMany(() => Comment, (comment) => comment.opinion)
  comments: Comment[];

  @OneToMany(() => User, (user) => user.opinions)
  users: User[];
}