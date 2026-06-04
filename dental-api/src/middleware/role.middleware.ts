import { Request, Response, NextFunction } from 'express';
import { AuthUser } from './auth.middleware';

type Role = 'ADMIN' | 'SUPER_ADMIN';

const ROLE_HIERARCHY: Record<Role, number> = {
  ADMIN: 1,
  SUPER_ADMIN: 2,
};

/**
 * Factory function that returns a middleware requiring a minimum role level.
 * requireRole('ADMIN')       → allows ADMIN and SUPER_ADMIN
 * requireRole('SUPER_ADMIN') → allows only SUPER_ADMIN
 */
export function requireRole(minimumRole: Role) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user as AuthUser | undefined;

    if (!user) {
      res.status(401).json({ error: 'Unauthenticated' });
      return;
    }

    const userLevel = ROLE_HIERARCHY[user.role] ?? 0;
    const requiredLevel = ROLE_HIERARCHY[minimumRole];

    if (userLevel < requiredLevel) {
      res.status(403).json({
        error: 'Insufficient permissions',
        required: minimumRole,
        current: user.role,
      });
      return;
    }

    next();
  };
}
