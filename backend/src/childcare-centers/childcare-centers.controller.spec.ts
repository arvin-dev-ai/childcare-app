import { Test, TestingModule } from '@nestjs/testing';
import { ChildcareCentersController } from './childcare-centers.controller';
import { ChildcareCentersService } from './childcare-centers.service';
import { JwtAuthGuard } from '../auth/auth.bundle';
import { PermissionsGuard } from '../permissions/permissions.bundle';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

const mockChildcareCentersService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findAllByGroup: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ChildcareCentersController', () => {
  let app: INestApplication;
  let service: ChildcareCentersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChildcareCentersController],
      providers: [
        {
          provide: ChildcareCentersService,
          useValue: mockChildcareCentersService,
        },
      ],
    })
    .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
    .overrideGuard(PermissionsGuard).useValue({ canActivate: () => true })
    .compile();

    app = module.createNestApplication();
    await app.init();

    service = module.get<ChildcareCentersService>(ChildcareCentersService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', () => {
    const controller = app.get<ChildcareCentersController>(ChildcareCentersController);
    expect(controller).toBeDefined();
  });

  describe('POST /childcare-centers', () => {
    it('should create a center', async () => {
      const dto = { name: 'New Center', address: '123 Main St', childcareGroupId: 'group-1' };
      const expectedCenter = { id: 'center-1', ...dto };
      jest.spyOn(service, 'create').mockResolvedValue(expectedCenter as any);

      return request(app.getHttpServer())
        .post('/childcare-centers')
        .send(dto)
        .expect(201)
        .expect(expectedCenter);
    });
  });

  describe('GET /childcare-centers/by-group/:groupId', () => {
    it('should find all centers for a group', async () => {
      const groupId = 'group-1';
      const expectedCenters = [{ id: 'center-1', name: 'Center One', address: '123 Main St' }];
      jest.spyOn(service, 'findAllByGroup').mockResolvedValue(expectedCenters as any);

      return request(app.getHttpServer())
        .get(`/childcare-centers/by-group/${groupId}`)
        .expect(200)
        .expect(expectedCenters);
    });
  });

  describe('GET /childcare-centers/:id', () => {
    it('should find a single center', async () => {
      const centerId = 'center-1';
      const expectedCenter = { id: centerId, name: 'Center One', address: '123 Main St' };
      jest.spyOn(service, 'findOne').mockResolvedValue(expectedCenter as any);

      return request(app.getHttpServer())
        .get(`/childcare-centers/${centerId}`)
        .expect(200)
        .expect(expectedCenter);
    });
  });

  describe('DELETE /childcare-centers/:id', () => {
    it('should remove a center', async () => {
      const centerId = 'center-1';
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      return request(app.getHttpServer())
        .delete(`/childcare-centers/${centerId}`)
        .expect(200);
    });
  });
});
