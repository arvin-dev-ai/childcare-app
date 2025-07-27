import { Entity, PrimaryGeneratedColumn, ManyToOne, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ChildcareCenter } from '../../childcare-centers/entities/childcare-center.entity';
import { Role } from '../../roles/entities/role.entity';

@Entity('center_memberships')
@Unique(['user', 'center', 'role'])
export class CenterMembership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.centerMemberships, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => ChildcareCenter, (center) => center.memberships, { onDelete: 'CASCADE' })
  center: ChildcareCenter;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  role: Role;
}
