import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { GroupMembershipsService } from './group-memberships.service';
import { CreateGroupMembershipDto } from './dto/create-group-membership.dto';
import { CreateUserWithGroupMembershipDto } from './dto/create-user-with-group-membership.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('group-memberships')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GroupMembershipsController {
  constructor(private readonly groupMembershipsService: GroupMembershipsService) {}

  @Post()
    @Roles('Super Admin')
  create(@Body() createGroupMembershipDto: CreateGroupMembershipDto) {
    return this.groupMembershipsService.create(createGroupMembershipDto);
  }

  @Post('with-user')
  @Roles('Super Admin')
  createUserWithGroupMembership(
    @Body() createUserWithGroupMembershipDto: CreateUserWithGroupMembershipDto,
  ) {
    return this.groupMembershipsService.createUserWithGroupMembership(
      createUserWithGroupMembershipDto,
    );
  }

  @Get('by-group/:groupId')
    @Roles('Super Admin')
  findByGroup(@Param('groupId') groupId: string) {
    return this.groupMembershipsService.findByGroup(groupId);
  }
}
