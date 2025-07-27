import { PartialType } from '@nestjs/mapped-types';
import { CreateChildcareGroupDto } from './create-childcare-group.dto';

export class UpdateChildcareGroupDto extends PartialType(
  CreateChildcareGroupDto,
) {}
