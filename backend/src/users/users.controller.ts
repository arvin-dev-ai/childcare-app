import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateUserWithMembershipDto } from './dto/create-user-with-membership.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
    @Roles('Super Admin')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('with-membership')
  @Roles('Super Admin', 'Childcare Group Admin')
  createUserWithMembership(
    @Body() createUserWithMembershipDto: CreateUserWithMembershipDto,
  ) {
    return this.usersService.createUserWithMembership(
      createUserWithMembershipDto,
    );
  }

  @Get()
    @Roles('Super Admin')
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
    @Roles('Super Admin')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get('by-center/:centerId')
  @Roles('Super Admin', 'Childcare Group Admin')
  findAllByCenter(@Param('centerId') centerId: string) {
    return this.usersService.findAllByCenter(centerId);
  }

  @Get('by-email/:email')
    @Roles('Super Admin')
  async findByEmail(@Param('email') email: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
