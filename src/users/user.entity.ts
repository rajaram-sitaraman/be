import { Types } from 'mysql2';
import { Comments } from 'src/comments/comment.entity';
import { Opinion } from 'src/opinions/opinion.entity';
import { Roster } from 'src/roster/roster.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  phone: string;

  @Column()
  deviceId: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  dob: string;

  @Column({ nullable: true })
  otp: number;

  @Column({ nullable: true })
  otpExpires: Date;

  @Column({ default: 0 })
  resendOtps: number;

  @Column({ default: false })
  isValidated: boolean;

  @CreateDateColumn({ type: 'datetime' })
  dateCreated: Date;

  @OneToMany(() => Comments, (comments) => comments.owner)
  comments: Comments[];

  @OneToMany(() => Opinion, (opinion) => opinion.user)
  opinions: Opinion[];

  @OneToMany(() => Roster, (roster) => roster.user1 || roster.user2)
  rosters: Roster[];

  // Not a column, but a property to indicate if the user should be forced to log in again
  forceLogin: boolean = false;
  
}