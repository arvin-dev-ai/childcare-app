import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { UsersService } from '../src/users/users.service';
import { RolesService } from '../src/roles/roles.service';
import { User } from '../src/users/entities/user.entity';
import { Role } from '../src/roles/entities/role.entity';
import { ROLES } from '../src/auth/roles.constants';
import { PermissionsService } from '../src/permissions/permissions.service';
import { Permission } from '../src/permissions/entities/permission.entity';
import { ChildcareGroup } from '../src/childcare-groups/entities/childcare-group.entity';
import { ChildcareCenter } from '../src/childcare-centers/entities/childcare-center.entity';
import { CenterMembership } from '../src/center-memberships/entities/center-membership.entity';

describe('Roles and Memberships (e2e)', () => {
  jest.setTimeout(30000); // Increase timeout to 30s for slower hooks
  let app: INestApplication;
  let connection: Connection;
  let usersRepository: Repository<User>;
  let superAdminToken: string;
  let childcareGroupId: string;
  let childcareCenterId: string;
  let testUser: Omit<User, 'password'>;
  let centerAdminRole: Role;

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
    const rolesService = moduleFixture.get<RolesService>(RolesService);
    const permissionsService = moduleFixture.get<PermissionsService>(PermissionsService);
    usersRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));

    // Seed necessary permissions
    const permissionDefinitions = [
      { name: 'manage_roles' },
      { name: 'manage_childcare_groups' },
      { name: 'manage_childcare_centers' },
      { name: 'view_childcare_centers' }, // Add view permission for testing
    ];
    const permissionIds = await Promise.all(
      permissionDefinitions.map(async (p) => {
        const created = await permissionsService.create(p);
        return created.id;
      }),
    );

    // 1. Setup Super Admin Role and User
    const superAdminRole = await rolesService.create({ name: ROLES.SUPER_ADMIN, permissionIds });

    await usersService.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@test.com',
      password: 'password',
      roleId: superAdminRole.id,
    });

    // 2. Log in as Super Admin
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'superadmin@test.com', password: 'password' });
    superAdminToken = loginResponse.body.access_token;

    // 3. Create Childcare Group
    const groupResponse = await request(app.getHttpServer())
      .post('/childcare-groups')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ name: 'Test Group' });
    childcareGroupId = groupResponse.body.id;

    // 4. Create Childcare Center
    const centerResponse = await request(app.getHttpServer())
      .post('/childcare-centers')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ name: 'Test Center', address: '123 Test St', childcareGroupId });
    childcareCenterId = centerResponse.body.id;

    // 5. Create a standard user for testing assignments
    testUser = await usersService.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@test.com',
      password: 'password',
    });

    // 6. Create a group-specific role for testing assignments
    const viewCentersPermission = await permissionsService.findOneByName('view_childcare_centers');
    if (!viewCentersPermission) {
      throw new Error('view_childcare_centers permission not found after seeding');
    }

    // 6. Create a group-specific role for testing assignments
    const roleResponse = await request(app.getHttpServer())
      .post('/roles')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ name: 'Center Admin', permissionIds: [viewCentersPermission.id], childcareGroupId });
    centerAdminRole = roleResponse.body;
  });

  afterEach(async () => {
    await connection.close();
    await app.close();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('Role and Membership Management', () => {
    it('should allow a super admin to assign a user to a center with a role', async () => {
      const response = await request(app.getHttpServer())
        .post('/center-memberships')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          userId: testUser.id,
          centerId: childcareCenterId,
          roleId: centerAdminRole.id,
        });

      expect(response.status).toBe(201);
      expect(response.body.user.id).toBe(testUser.id);
      expect(response.body.center.id).toBe(childcareCenterId);
      expect(response.body.role.id).toBe(centerAdminRole.id);
    });
  });

  describe('Authorization', () => {
    let testUserToken: string;

    beforeEach(async () => {
      // Assign the test user to the center so they can log in and have context
      await request(app.getHttpServer())
        .post('/center-memberships')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ userId: testUser.id, centerId: childcareCenterId, roleId: centerAdminRole.id });

      // Log in as the test user to get their token
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'testuser@test.com', password: 'password' });
      testUserToken = loginResponse.body.access_token;
    });

    it('should allow a user to access a resource in their own center', async () => {
      const response = await request(app.getHttpServer())
        .get(`/childcare-centers/${childcareCenterId}`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(childcareCenterId);
    });

    it('should forbid a user from accessing a resource in another center', async () => {
      const anotherGroupResponse = await request(app.getHttpServer())
        .post('/childcare-groups')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ name: 'Another Group' });
      const anotherGroupId = anotherGroupResponse.body.id;

      const anotherCenterResponse = await request(app.getHttpServer())
        .post('/childcare-centers')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ name: 'Another Center', address: '456 Other St', childcareGroupId: anotherGroupId });
      const anotherCenterId = anotherCenterResponse.body.id;

      const response = await request(app.getHttpServer())
        .get(`/childcare-centers/${anotherCenterId}`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(403);
    });

    it('should forbid a user from accessing super-admin-only resources', async () => {
      const response = await request(app.getHttpServer())
        .post('/childcare-groups')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ name: 'Unauthorized Group' });

      expect(response.status).toBe(403);
    });
  });
});
