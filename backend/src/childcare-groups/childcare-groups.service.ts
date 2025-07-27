import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateChildcareGroupDto } from './dto/create-childcare-group.dto';
import { UpdateChildcareGroupDto } from './dto/update-childcare-group.dto';
import { ChildcareGroup } from './entities/childcare-group.entity';

@Injectable()
export class ChildcareGroupsService {
  constructor(
    @InjectRepository(ChildcareGroup)
    private readonly childcareGroupRepository: Repository<ChildcareGroup>,
  ) {}

  create(createChildcareGroupDto: CreateChildcareGroupDto): Promise<ChildcareGroup> {
    const group = this.childcareGroupRepository.create(createChildcareGroupDto);
    return this.childcareGroupRepository.save(group);
  }

  findAll(): Promise<ChildcareGroup[]> {
    return this.childcareGroupRepository.find();
  }

  async findOne(id: string): Promise<ChildcareGroup> {
    const group = await this.childcareGroupRepository.findOne({ where: { id } });
    if (!group) {
      throw new NotFoundException(`ChildcareGroup with ID "${id}" not found`);
    }
    return group;
  }

  async update(id: string, updateChildcareGroupDto: UpdateChildcareGroupDto): Promise<ChildcareGroup> {
    const group = await this.childcareGroupRepository.preload({
      id: id,
      ...updateChildcareGroupDto,
    });
    if (!group) {
      throw new NotFoundException(`ChildcareGroup with ID "${id}" not found`);
    }
    return this.childcareGroupRepository.save(group);
  }

  async remove(id: string): Promise<void> {
    const result = await this.childcareGroupRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`ChildcareGroup with ID "${id}" not found`);
    }
  }
}
