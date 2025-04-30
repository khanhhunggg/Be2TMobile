import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserInformation } from './user-information.entity';

export enum UserRank {
  Bronze = 'Bronze',
  Silver = 'Silver',
  Gold = 'Gold',
  Platinum = 'Platinum',
  Diamond = 'Diamond',
}

@Entity('tbl_users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'information_id', nullable: true })
  informationId: number;

  @Column({ name: 'user_name', unique: true })
  userName: string;

  @Column({ name: 'phone_number' })
  phoneNumber: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ name: 'is_admin', default: false })
  isAdmin: boolean;

  @Column({
    name: 'user_rank',
    type: 'enum',
    enum: UserRank,
    default: UserRank.Bronze,
    comment: 'Hạng thành viên dành cho khách hàng',
  })
  userRank: UserRank;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => UserInformation, { nullable: true })
  @JoinColumn({ name: 'information_id' })
  userInformation: UserInformation;
}
