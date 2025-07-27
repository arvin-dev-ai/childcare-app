import { ChildcareCenter } from '../../childcare-centers/entities/childcare-center.entity';
import { GroupMembership } from '../../group-memberships/entities/group-membership.entity';
import { Role } from '../../roles/entities/role.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('childcare_groups')
export class ChildcareGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => ChildcareCenter, (center) => center.childcareGroup)
  centers: ChildcareCenter[];

  @OneToMany(() => GroupMembership, (membership) => membership.group)
  memberships: GroupMembership[];

  @OneToMany(() => Role, (role) => role.childcareGroup)
  roles: Role[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
