import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CenterMembership } from './entities/center-membership.entity';
import { CreateCenterMembershipDto } from './dto/create-center-membership.dto';
import { User } from '../users/entities/user.entity';
import { ChildcareCenter } from '../childcare-centers/entities/childcare-center.entity';
import { Role } from '../roles/entities/role.entity';

@Injectable()
export class CenterMembershipsService {
  constructor(
    @InjectRepository(CenterMembership)
    private membershipsRepository: Repository<CenterMembership>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(ChildcareCenter)
    private centersRepository: Repository<ChildcareCenter>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async create(createDto: CreateCenterMembershipDto): Promise<CenterMembership> {
    const { userId, centerId, roleId } = createDto;

    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    const center = await this.centersRepository.findOneBy({ id: centerId });
    if (!center) throw new NotFoundException(`Center with ID ${centerId} not found`);

    const role = await this.rolesRepository.findOneBy({ id: roleId });
    if (!role) throw new NotFoundException(`Role with ID ${roleId} not found`);

    const newMembership = this.membershipsRepository.create({ user, center, role });
    return this.membershipsRepository.save(newMembership);
  }
}
