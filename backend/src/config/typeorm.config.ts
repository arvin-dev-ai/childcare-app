import { DataSourceOptions } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { ChildcareGroup } from '../childcare-groups/entities/childcare-group.entity';
import { ChildcareCenter } from '../childcare-centers/entities/childcare-center.entity';
import { CenterMembership } from '../center-memberships/entities/center-membership.entity';

dotenvConfig({ path: '.env' });

export const config: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'user',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'childcare_db',
  entities: [User, Role, Permission, ChildcareGroup, ChildcareCenter, CenterMembership],
  // synchronize is set to false to prevent automatic schema changes.
  // The application will enable it explicitly, and the global setup will manage it for tests.
  synchronize: false,
};
