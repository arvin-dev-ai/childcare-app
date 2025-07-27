import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES } from '../roles.constants';
import { CenterMembership } from '../../center-memberships/entities/center-membership.entity';



@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No roles required, access granted.
    }

    const { user, params } = context.switchToHttp().getRequest();

    if (!user) {
      return false; // No user attached to the request.
    }

    // 1. Super Admin has unrestricted access.
    if (user.role?.name === ROLES.SUPER_ADMIN) {
      return true;
    }

    // 2. Check for center-specific roles if a centerId is present in the route.
    const centerId = params.centerId || params.id; // Accommodate different param names
    if (centerId && user.centerMemberships) {
      const hasCenterRole = user.centerMemberships.some(
        (membership: CenterMembership) =>
          membership.center?.id === centerId &&
          requiredRoles.includes(membership.role?.name),
      );
      if (hasCenterRole) {
        return true;
      }
    }

    // 3. Fallback to checking the user's global role.
    const hasGlobalRole = requiredRoles.some((role) => user.role?.name === role);
    if (hasGlobalRole) {
      return true;
    }

    // 4. If none of the above conditions are met, deny access.
    return false;
  }
}
