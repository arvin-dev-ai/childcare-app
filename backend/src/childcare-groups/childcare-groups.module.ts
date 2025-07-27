import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChildcareGroupsService } from './childcare-groups.service';
import { ChildcareGroupsController } from './childcare-groups.controller';
import { ChildcareGroup } from './entities/childcare-group.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([ChildcareGroup]), AuthModule],
  controllers: [ChildcareGroupsController],
  providers: [ChildcareGroupsService],
})
export class ChildcareGroupsModule {}
