import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupMembership } from './entities/group-membership.entity';
import { GroupMembershipsService } from './group-memberships.service';
import { GroupMembershipsController } from './group-memberships.controller';
import { UsersModule } from '../users/users.module';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [TypeOrmModule.forFeature([GroupMembership]), UsersModule, RolesModule],
  controllers: [GroupMembershipsController],
  providers: [GroupMembershipsService],
  exports: [GroupMembershipsService],
})
export class GroupMembershipsModule {}
