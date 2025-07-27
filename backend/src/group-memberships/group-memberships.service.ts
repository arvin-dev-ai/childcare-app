import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupMembership } from './entities/group-membership.entity';
import { CreateGroupMembershipDto } from './dto/create-group-membership.dto';
import { CreateUserWithGroupMembershipDto } from './dto/create-user-with-group-membership.dto';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class GroupMembershipsService {
  constructor(
    @InjectRepository(GroupMembership)
    private readonly groupMembershipRepository: Repository<GroupMembership>,
    private usersService: UsersService,
    private rolesService: RolesService,
  ) {}

  async create(createGroupMembershipDto: CreateGroupMembershipDto): Promise<GroupMembership> {
    const newMembership = this.groupMembershipRepository.create(createGroupMembershipDto);
    return this.groupMembershipRepository.save(newMembership);
  }

  async findByGroup(groupId: string): Promise<GroupMembership[]> {
    return this.groupMembershipRepository.find({ where: { group: { id: groupId } }, relations: ['user', 'role', 'group'] });
  }

  async findByUser(userId: string): Promise<GroupMembership[]> {
    return this.groupMembershipRepository.find({
      where: { user: { id: userId } },
      relations: ['group'],
    });
  }

  async createUserWithGroupMembership(dto: CreateUserWithGroupMembershipDto) {
    // 1. Find the 'Childcare Group Admin' role
    const role = await this.rolesService.findOneByName('Childcare Group Admin');
    if (!role) {
      throw new NotFoundException('"Childcare Group Admin" role not found.');
    }

    // 2. Create the user
    const user = await this.usersService.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: dto.password,
      roleId: role.id, // Assign a base role, though it's the group membership that matters here
    });

    // 3. Create the group membership
    const groupMembership = this.groupMembershipRepository.create({
      userId: user.id,
      groupId: dto.groupId,
      roleId: role.id,
    });

    await this.groupMembershipRepository.save(groupMembership);

    return user;
  }
}
