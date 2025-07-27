import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ChildcareCentersService } from './childcare-centers.service';
import { ChildcareCenter } from './entities/childcare-center.entity';
import { ChildcareGroup } from '../childcare-groups/entities/childcare-group.entity';
import { CreateChildcareCenterDto } from './dto/create-childcare-center.dto';

const mockChildcareCenterRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  preload: jest.fn(),
  delete: jest.fn(),
});

const mockChildcareGroupRepository = () => ({
  findOne: jest.fn(),
});

describe('ChildcareCentersService', () => {
  let service: ChildcareCentersService;
  let centerRepository: Repository<ChildcareCenter>;
  let groupRepository: Repository<ChildcareGroup>;

  const mockGroupId = 'group-uuid-1';
  const mockCenterId = 'center-uuid-1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChildcareCentersService,
        {
          provide: getRepositoryToken(ChildcareCenter),
          useFactory: mockChildcareCenterRepository,
        },
        {
          provide: getRepositoryToken(ChildcareGroup),
          useFactory: mockChildcareGroupRepository,
        },
      ],
    }).compile();

    service = module.get<ChildcareCentersService>(ChildcareCentersService);
    centerRepository = module.get<Repository<ChildcareCenter>>(getRepositoryToken(ChildcareCenter));
    groupRepository = module.get<Repository<ChildcareGroup>>(getRepositoryToken(ChildcareGroup));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a childcare center', async () => {
      const createDto: CreateChildcareCenterDto = { name: 'Test Center', address: '123 Test St', childcareGroupId: mockGroupId };
      const mockGroup = { id: mockGroupId, name: 'Test Group', centers: [] };
      const mockCenter = { id: mockCenterId, ...createDto, childcareGroup: mockGroup };

      jest.spyOn(groupRepository, 'findOne').mockResolvedValue(mockGroup as any);
      jest.spyOn(centerRepository, 'create').mockReturnValue(mockCenter as any);
      jest.spyOn(centerRepository, 'save').mockResolvedValue(mockCenter as any);

      const result = await service.create(createDto);

      expect(groupRepository.findOne).toHaveBeenCalledWith({ where: { id: mockGroupId } });
      expect(centerRepository.create).toHaveBeenCalledWith({ name: 'Test Center', address: '123 Test St', childcareGroup: mockGroup });
      expect(centerRepository.save).toHaveBeenCalledWith(mockCenter);
      expect(result).toEqual(mockCenter);
    });

    it('should throw NotFoundException if group does not exist', async () => {
      const createDto: CreateChildcareCenterDto = { name: 'Test Center', address: '123 Test St', childcareGroupId: 'non-existent-group' };
      jest.spyOn(groupRepository, 'findOne').mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllByGroup', () => {
    it('should return an array of centers for a given group', async () => {
      const mockCenters = [{ id: mockCenterId, name: 'Test Center', address: '123 Test St' }];
      jest.spyOn(centerRepository, 'find').mockResolvedValue(mockCenters as any);

      const result = await service.findAllByGroup(mockGroupId);

      expect(centerRepository.find).toHaveBeenCalledWith({
        where: { childcareGroup: { id: mockGroupId } },
        relations: ['childcareGroup'],
      });
      expect(result).toEqual(mockCenters);
    });
  });

  describe('findOne', () => {
    it('should return a single center', async () => {
      const mockCenter = { id: mockCenterId, name: 'Test Center', address: '123 Test St' };
      jest.spyOn(centerRepository, 'findOne').mockResolvedValue(mockCenter as any);

      const result = await service.findOne(mockCenterId);
      expect(result).toEqual(mockCenter);
      expect(centerRepository.findOne).toHaveBeenCalledWith({ where: { id: mockCenterId }, relations: ['childcareGroup'] });
    });

    it('should throw NotFoundException if center is not found', async () => {
      jest.spyOn(centerRepository, 'findOne').mockResolvedValue(null);
      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a center', async () => {
      jest.spyOn(centerRepository, 'delete').mockResolvedValue({ affected: 1 } as any);
      await service.remove(mockCenterId);
      expect(centerRepository.delete).toHaveBeenCalledWith(mockCenterId);
    });

    it('should throw NotFoundException if center to delete is not found', async () => {
      jest.spyOn(centerRepository, 'delete').mockResolvedValue({ affected: 0 } as any);
      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });
});
