import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
      return true; // No permissions required, access granted
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.role || !user.role.permissions) {
      return false; // User or role/permissions not found
    }

    return requiredPermissions.every((permission) =>
      user.role.permissions.some((p: Permission) => p.name === permission),
    );
  }
}
