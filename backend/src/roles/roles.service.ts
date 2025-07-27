import { Injectable, InternalServerErrorException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

    findAll(childcareGroupId?: string): Promise<Role[]> {
    return this.rolesRepository.find({
      where: {
        childcareGroup: childcareGroupId ? { id: childcareGroupId } : IsNull(),
      },
      relations: ['permissions'],
    });
  }

  async findCenterAssignableRoles(): Promise<Role[]> {
    return this.rolesRepository.find({
      where: {
        name: Not(In(['Super Admin', 'Childcare Group Admin'])),
      },
    });
  }

  findOne(id: string): Promise<Role | null> {
    return this.rolesRepository.findOne({
      where: { id },
      relations: ['permissions', 'childcareGroup'],
    });
  }

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const { name, permissionIds, childcareGroupId } = createRoleDto;

    const newRoleData: Partial<Role> = {
      name,
    };

    if (permissionIds) {
      newRoleData.permissions = permissionIds.map((id) => ({ id } as Permission));
    }

    if (childcareGroupId) {
      newRoleData.childcareGroup = { id: childcareGroupId } as any;
    }

    const newRole = this.rolesRepository.create(newRoleData);

    try {
      const savedRole = await this.rolesRepository.save(newRole);
      const roleWithRelations = await this.findOne(savedRole.id);
      if (!roleWithRelations) {
        throw new InternalServerErrorException(
          `Could not find role with id ${savedRole.id} after creation.`,
        );
      }
      return roleWithRelations;
    } catch (error) {
      if (error.code === '23505') {
        // Unique constraint violation
        throw new ConflictException(
          'A role with this name already exists in the specified group.',
        );
      }
      throw error;
    }
  }

  async findOneByName(
    name: string,
    childcareGroupId?: string,
  ): Promise<Role | null> {
    return this.rolesRepository.findOne({
      where: {
        name,
        childcareGroup: childcareGroupId ? { id: childcareGroupId } : IsNull(),
      },
    });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.rolesRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Role with ID "${id}" not found`);
    }

    if (updateRoleDto.name) {
      role.name = updateRoleDto.name;
    }

    if (updateRoleDto.permissionIds) {
      const permissions = await this.permissionsRepository.findBy({
        id: In(updateRoleDto.permissionIds),
      });
      if (permissions.length !== updateRoleDto.permissionIds.length) {
        throw new NotFoundException('One or more permissions not found.');
      }
      role.permissions = permissions;
    }

    return this.rolesRepository.save(role);
  }
}
