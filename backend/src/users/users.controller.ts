import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { SUPER_ADMIN } from '../auth/roles.constants';
import { CreateUserWithMembershipDto } from './dto/create-user-with-membership.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(SUPER_ADMIN)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('with-membership')
  @Roles(SUPER_ADMIN)
  createUserWithMembership(
    @Body() createUserWithMembershipDto: CreateUserWithMembershipDto,
  ) {
    return this.usersService.createUserWithMembership(
      createUserWithMembershipDto,
    );
  }

  @Get()
  @Roles(SUPER_ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(SUPER_ADMIN)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get('by-center/:centerId')
  @Roles(SUPER_ADMIN)
  findAllByCenter(@Param('centerId') centerId: string) {
    return this.usersService.findAllByCenter(centerId);
  }
}
