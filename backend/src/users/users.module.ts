import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { AuthModule } from '../auth/auth.module';
import { CenterMembership } from '../center-memberships/entities/center-membership.entity';
import { ChildcareCenter } from '../childcare-centers/entities/childcare-center.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, CenterMembership, ChildcareCenter]), forwardRef(() => AuthModule)],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
