import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ChildcareGroup } from '../../childcare-groups/entities/childcare-group.entity';
import { Role } from '../../roles/entities/role.entity';

@Entity('group_memberships')
export class GroupMembership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.groupMemberships)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => ChildcareGroup, (group) => group.memberships)
  @JoinColumn({ name: 'groupId' })
  group: ChildcareGroup;

  @Column()
  groupId: string;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @Column()
  roleId: string;
}
