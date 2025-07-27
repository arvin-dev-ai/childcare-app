import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { AuthService } from './../src/auth/auth.service';
import { UsersService } from '../src/users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { Role } from '../src/roles/entities/role.entity';
import { ROLES } from '../src/auth/roles.constants';
import { RolesService } from '../src/roles/roles.service';
import { PermissionsService } from '../src/permissions/permissions.service';

describe('ChildcareCentersController (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let accessToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    connection = moduleFixture.get<Connection>(Connection);
    await connection.synchronize(true); // Resets database

    const usersService = moduleFixture.get<UsersService>(UsersService);
    const authService = moduleFixture.get<AuthService>(AuthService);
    const rolesService = moduleFixture.get<RolesService>(RolesService);
    const permissionsService = moduleFixture.get<PermissionsService>(PermissionsService);

    // Seed necessary permissions
    const permissionDefinitions = [{ name: 'manage_childcare_groups' }, { name: 'manage_childcare_centers' }];
    const permissionIds = await Promise.all(
      permissionDefinitions.map(async (p) => {
        const created = await permissionsService.create(p);
        return created.id;
      }),
    );

    // Setup Super Admin Role and User
    const superAdminRole = await rolesService.create({ name: ROLES.SUPER_ADMIN, permissionIds });

    await usersService.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@test.com',
      password: 'password',
      roleId: superAdminRole.id,
    });

    // Log in as Super Admin
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'superadmin@test.com', password: 'password' });
    accessToken = loginResponse.body.access_token;
  });

  afterEach(async () => {
    await connection.close();
    await app.close();
  });

  it('/childcare-centers (GET)', async () => {
    // 1. Create a childcare group first
    const groupResponse = await request(app.getHttpServer())
      .post('/childcare-groups')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Test Group' })
      .expect(201);

    const childcareGroupId = groupResponse.body.id;

    // 2. Create a childcare center associated with the group
    await request(app.getHttpServer())
      .post('/childcare-centers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Test Center', address: '123 Test St', childcareGroupId })
      .expect(201);

    // 3. Get all centers
    const response = await request(app.getHttpServer())
      .get('/childcare-centers')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(1);
    expect(response.body[0].name).toBe('Test Center');
  });
});
