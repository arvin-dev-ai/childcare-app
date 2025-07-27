import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ChildcareGroupsService } from './childcare-groups.service';
import { CreateChildcareGroupDto } from './dto/create-childcare-group.dto';
import { UpdateChildcareGroupDto } from './dto/update-childcare-group.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { SUPER_ADMIN, CHILDCARE_GROUP_ADMIN } from '../auth/roles.constants';

@Controller('childcare-groups')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChildcareGroupsController {
  constructor(private readonly childcareGroupsService: ChildcareGroupsService) {}

  @Post()
  @Roles(SUPER_ADMIN)
  create(@Body() createChildcareGroupDto: CreateChildcareGroupDto) {
    return this.childcareGroupsService.create(createChildcareGroupDto);
  }

  @Get()
  findAll() {
    return this.childcareGroupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.childcareGroupsService.findOne(id);
  }

  @Patch(':id')
  @Roles(SUPER_ADMIN, CHILDCARE_GROUP_ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateChildcareGroupDto: UpdateChildcareGroupDto) {
    return this.childcareGroupsService.update(id, updateChildcareGroupDto);
  }

  @Delete(':id')
  @Roles(SUPER_ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.childcareGroupsService.remove(id);
  }
}
