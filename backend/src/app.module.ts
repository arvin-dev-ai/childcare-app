import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';



import { RolesModule } from './roles/roles.module';
import { ChildcareGroupsModule } from './childcare-groups/childcare-groups.module';
import { ChildcareCentersModule } from './childcare-centers/childcare-centers.module';
import { PermissionsModule } from './permissions/permissions.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { CenterMembershipsModule } from './center-memberships/center-memberships.module';
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

