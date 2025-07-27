import { PartialType } from '@nestjs/mapped-types';
import { CreateChildcareCenterDto } from './create-childcare-center.dto';

export class UpdateChildcareCenterDto extends PartialType(
  CreateChildcareCenterDto,
) {}
