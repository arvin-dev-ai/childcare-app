import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CenterMembership } from './entities/center-membership.entity';
import { User } from '../users/entities/user.entity';
import { ChildcareCenter } from '../childcare-centers/entities/childcare-center.entity';
import { Role } from '../roles/entities/role.entity';
import { CenterMembershipsService } from './center-memberships.service';
import { CenterMembershipsController } from './center-memberships.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CenterMembership,
      User,
      ChildcareCenter,
      Role,
    ]),
  ],
  providers: [CenterMembershipsService],
  controllers: [CenterMembershipsController],
  exports: [CenterMembershipsService],
})
export class CenterMembershipsModule {}
