import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ChildcareCentersService } from './childcare-centers.service';
import { CreateChildcareCenterDto } from './dto/create-childcare-center.dto';
import { UpdateChildcareCenterDto } from './dto/update-childcare-center.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('childcare-centers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChildcareCentersController {
  constructor(private readonly childcareCentersService: ChildcareCentersService) {}

  @Post()
  @Roles('Super Admin', 'Childcare Group Admin')
  create(@Body() createChildcareCenterDto: CreateChildcareCenterDto) {
    return this.childcareCentersService.create(createChildcareCenterDto);
  }

  @Get()
  @Roles('Super Admin', 'Center Admin', 'Childcare Group Admin')
  findAll() {
    return this.childcareCentersService.findAll();
  }

  @Get('by-group/:groupId')
  @Roles('Super Admin', 'Center Admin', 'Childcare Group Admin')
  findAllByGroup(@Param('groupId', ParseUUIDPipe) groupId: string) {
    return this.childcareCentersService.findAllByGroup(groupId);
  }

  @Get(':id')
  @Roles('Super Admin', 'Center Admin')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.childcareCentersService.findOne(id);
  }

  @Patch(':id')
  @Roles('Super Admin', 'Center Admin')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateChildcareCenterDto: UpdateChildcareCenterDto) {
    return this.childcareCentersService.update(id, updateChildcareCenterDto);
  }

  @Delete(':id')
  @Roles('Super Admin')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.childcareCentersService.remove(id);
  }
}
