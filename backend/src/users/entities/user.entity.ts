import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { CenterMembership } from '../../center-memberships/entities/center-membership.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // This will be a hashed password

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @OneToMany(() => CenterMembership, (membership) => membership.user)
  centerMemberships: CenterMembership[];
}
