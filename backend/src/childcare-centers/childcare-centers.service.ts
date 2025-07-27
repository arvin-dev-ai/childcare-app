import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateChildcareCenterDto } from './dto/create-childcare-center.dto';
import { UpdateChildcareCenterDto } from './dto/update-childcare-center.dto';
import { ChildcareCenter } from './entities/childcare-center.entity';
import { ChildcareGroup } from '../childcare-groups/entities/childcare-group.entity';

@Injectable()
export class ChildcareCentersService {
  constructor(
    @InjectRepository(ChildcareCenter)
    private readonly childcareCenterRepository: Repository<ChildcareCenter>,
    @InjectRepository(ChildcareGroup)
    private readonly childcareGroupRepository: Repository<ChildcareGroup>,
  ) {}

  async create(createChildcareCenterDto: CreateChildcareCenterDto): Promise<ChildcareCenter> {
    const { name, address, childcareGroupId } = createChildcareCenterDto;

    const group = await this.childcareGroupRepository.findOne({ where: { id: childcareGroupId } });
    if (!group) {
      throw new NotFoundException(`ChildcareGroup with ID "${childcareGroupId}" not found`);
    }

    const center = this.childcareCenterRepository.create({ name, address, childcareGroup: group });
    return this.childcareCenterRepository.save(center);
  }

  findAll(): Promise<ChildcareCenter[]> {
    return this.childcareCenterRepository.find({ relations: ['childcareGroup'] });
  }

  findAllByGroup(groupId: string): Promise<ChildcareCenter[]> {
    return this.childcareCenterRepository.find({
      where: { childcareGroup: { id: groupId } },
      relations: ['childcareGroup'],
    });
  }

  async findOne(id: string): Promise<ChildcareCenter> {
    const center = await this.childcareCenterRepository.findOne({ where: { id }, relations: ['childcareGroup'] });
    if (!center) {
      throw new NotFoundException(`ChildcareCenter with ID "${id}" not found`);
    }
    return center;
  }

  async update(id: string, updateChildcareCenterDto: UpdateChildcareCenterDto): Promise<ChildcareCenter> {
    const center = await this.childcareCenterRepository.preload({
      id: id,
      ...updateChildcareCenterDto,
    });
    if (!center) {
      throw new NotFoundException(`ChildcareCenter with ID "${id}" not found`);
    }
    return this.childcareCenterRepository.save(center);
  }

  async remove(id: string): Promise<void> {
    const result = await this.childcareCenterRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`ChildcareCenter with ID "${id}" not found`);
    }
  }
}
