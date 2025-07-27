import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, ManyToOne, Unique } from 'typeorm';
import { Permission } from '../../permissions/entities/permission.entity';
import { ChildcareGroup } from '../../childcare-groups/entities/childcare-group.entity';

@Entity('roles')
@Unique(['name', 'childcareGroup'])
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToMany(() => Permission, { eager: true })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];

  @ManyToOne(() => ChildcareGroup, (group) => group.roles, { nullable: true, onDelete: 'CASCADE' })
  childcareGroup: ChildcareGroup;
}
