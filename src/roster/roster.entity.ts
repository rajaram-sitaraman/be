import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, ManyToOne } from 'typeorm';
import { Comments } from '../comments/comment.entity'; // Adjust the path to your Comment entity
import { User } from 'src/users/user.entity';

@Entity('roster')
export class Roster {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  otherguysname: string;

  @OneToMany(() => Comments, (comment) => comment.opinion)
  comments: Comments[];

  // Reference to the User entity
  @ManyToOne(() => User, (user) => user.rosters, { nullable: false, onDelete: 'CASCADE' })
  user1: User;

  // Reference to the User entity
  @ManyToOne(() => User, (user) => user.rosters, { nullable: false, onDelete: 'CASCADE' })
  user2: User;
  
}