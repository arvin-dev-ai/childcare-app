import { Injectable } from '@nestjs/common';
import { CenterMembership } from '../center-memberships/entities/center-membership.entity';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const centerMemberships = user.centerMemberships?.map((m: CenterMembership) => ({
      centerId: m.center.id,
      role: m.role.name,
    })) || [];

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role?.name, // Keep the global role for superadmins
      centerMemberships,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
