import { Controller, Post, Body } from '@nestjs/common';
import { CenterMembershipsService } from './center-memberships.service';
import { CreateCenterMembershipDto } from './dto/create-center-membership.dto';

@Controller('center-memberships')
export class CenterMembershipsController {
  constructor(private readonly membershipsService: CenterMembershipsService) {}

  @Post()
  create(@Body() createDto: CreateCenterMembershipDto) {
    return this.membershipsService.create(createDto);
  }
}
