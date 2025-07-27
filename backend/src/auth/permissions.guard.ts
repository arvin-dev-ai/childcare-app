import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { UsersService } from '../users/users.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions) {
      return true;
    }

    const { user: jwtPayload } = context.switchToHttp().getRequest();
    if (!jwtPayload) {
      return false; // Should be handled by JwtAuthGuard, but as a safeguard
    }

    const user = await this.usersService.findOne(jwtPayload.userId);
    if (!user || !user.role || !user.role.permissions) {
      return false;
    }

    const userPermissions = user.role.permissions.map(p => p.name);

    return requiredPermissions.every(permission =>
      userPermissions.includes(permission),
    );
  }
}
