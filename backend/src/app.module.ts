import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { Role } from './roles/entities/role.entity';
import { Permission } from './permissions/entities/permission.entity';
import { RolesModule } from './roles/roles.module';
import { ChildcareCenter } from './childcare-centers/entities/childcare-center.entity';
import { ChildcareGroup } from './childcare-groups/entities/childcare-group.entity';
import { CenterMembership } from './center-memberships/entities/center-membership.entity';
import { GroupMembership } from './group-memberships/entities/group-membership.entity';
import { ChildcareGroupsModule } from './childcare-groups/childcare-groups.module';
import { ChildcareCentersModule } from './childcare-centers/childcare-centers.module';
import { PermissionsModule } from './permissions/permissions.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { CenterMembershipsModule } from './center-memberships/center-memberships.module';
import { GroupMembershipsModule } from './group-memberships/group-memberships.module';
import { config as typeOrmConfig } from './config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        ...typeOrmConfig,
        entities: [User, Role, Permission, ChildcareCenter, ChildcareGroup, CenterMembership, GroupMembership],
        synchronize: true, // Explicitly enable for dev application
      }),
    }),
    UsersModule,
    ChildcareGroupsModule,
    ChildcareCentersModule,

    RolesModule,
    PermissionsModule,
    AuthModule,
    CenterMembershipsModule,
    GroupMembershipsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

