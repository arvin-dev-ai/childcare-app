import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChildcareCentersService } from './childcare-centers.service';
import { ChildcareCentersController } from './childcare-centers.controller';
import { ChildcareCenter } from './entities/childcare-center.entity';
import { ChildcareGroup } from '../childcare-groups/entities/childcare-group.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([ChildcareCenter, ChildcareGroup]), AuthModule],
  controllers: [ChildcareCentersController],
  providers: [ChildcareCentersService],
})
export class ChildcareCentersModule {}
