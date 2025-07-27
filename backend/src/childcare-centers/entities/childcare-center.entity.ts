import { ChildcareGroup } from '../../childcare-groups/entities/childcare-group.entity';
import { CenterMembership } from '../../center-memberships/entities/center-membership.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity('childcare_centers')
export class ChildcareCenter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @ManyToOne(() => ChildcareGroup, (group) => group.centers)
  childcareGroup: ChildcareGroup;

  @OneToMany(() => CenterMembership, (membership) => membership.center)
  memberships: CenterMembership[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
