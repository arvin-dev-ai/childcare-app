import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  findAll(): Promise<Permission[]> {
    return this.permissionsRepository.find();
  }

  findOneByName(name: string): Promise<Permission | null> {
    return this.permissionsRepository.findOneBy({ name });
  }

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const { name } = createPermissionDto;

    const existingPermission = await this.permissionsRepository.findOneBy({ name });
    if (existingPermission) {
      throw new ConflictException('Permission with this name already exists');
    }

    const newPermission = this.permissionsRepository.create(createPermissionDto);
    return this.permissionsRepository.save(newPermission);
  }
}
