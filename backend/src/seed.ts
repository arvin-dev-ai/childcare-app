import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { RolesService } from './roles/roles.service';
import { Role } from './roles/entities/role.entity';
import { PermissionsService } from './permissions/permissions.service';
import { Permission } from './permissions/entities/permission.entity';
import { SUPER_ADMIN } from './auth/roles.constants';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  // --- Seeding --- 
  const permissionsService = app.get(PermissionsService);
  const rolesService = app.get(RolesService);
  const usersService = app.get(UsersService);

  // 1. Seed Permissions
  console.log('Seeding permissions...');
  const corePermissionDefinitions = [
    { name: 'manage_users', description: 'Manage users' },
    { name: 'create_user', description: 'Create users' },
    { name: 'manage_roles', description: 'Manage roles' },
    { name: 'manage_childcare_groups', description: 'Manage childcare groups' },
    { name: 'manage_childcare_centers', description: 'Manage childcare centers' },
  ];
  const corePermissionEntities: Permission[] = [];
  for (const definition of corePermissionDefinitions) {
    let permission = await permissionsService.findOneByName(definition.name);
    if (!permission) {
      permission = await permissionsService.create(definition);
    }
    corePermissionEntities.push(permission);
  }
  console.log('Permissions seeding complete.');

  // 2. Seed Super Admin Role and Assign Permissions
  console.log('Seeding Super Admin role...');
  let superAdminRole: Role | null = await rolesService.findOneByName(SUPER_ADMIN);
  if (!superAdminRole) {
    const createdRole = await rolesService.create({ name: SUPER_ADMIN, permissionIds: [] });
    superAdminRole = await rolesService.findOne(createdRole.id);
  }

  if (!superAdminRole) {
    throw new Error('Failed to create or find Super Admin role.');
  }

  const requiredPermissionIdsSet = new Set(corePermissionEntities.map(p => p.id));
  const currentPermissionIdsSet = new Set(superAdminRole.permissions.map((p: Permission) => p.id));

  if (requiredPermissionIdsSet.size !== currentPermissionIdsSet.size) {
    console.log('Updating Super Admin role permissions...');
    await rolesService.update(superAdminRole.id, { 
      name: superAdminRole.name, 
      permissionIds: Array.from(requiredPermissionIdsSet) 
    });
    superAdminRole = await rolesService.findOne(superAdminRole.id);
    if (!superAdminRole) {
      throw new Error('Failed to re-fetch Super Admin role after permission update.');
    }
  }
  console.log('Super Admin role seeding complete.');

  // 2a. Seed other core roles
  console.log('Seeding other core roles...');
  const otherRoles = ['Center Admin', 'Center Manager', 'Educator', 'Childcare Group Admin'];
  for (const roleName of otherRoles) {
    let role = await rolesService.findOneByName(roleName);
    if (!role) {
      await rolesService.create({ name: roleName, permissionIds: [] });
    }
  }
  console.log('Core roles seeding complete.');

  // 3. Seed Super Admin User
  console.log('Seeding Super Admin user...');
  let superAdminUser = await usersService.findOneByEmail('superadmin@example.com');
  if (!superAdminUser) {
    await usersService.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@example.com',
      password: 'password',
      roleId: superAdminRole.id,
    });
    superAdminUser = await usersService.findOneByEmail('superadmin@example.com');
  }
  console.log('Super Admin user seeding complete.');

  await app.close();
}

bootstrap();
