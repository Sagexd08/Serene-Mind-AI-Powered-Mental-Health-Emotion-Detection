import { UserRole } from '@prisma/client';

export enum Permission {
  VIEW_ASSIGNED_CASES = 'view:assigned_cases',
  VIEW_ALL_CASES = 'view:all_cases',
  ASSIGN_CASES = 'assign:cases',
  CREATE_NOTE = 'create:note',
  RESOLVE_CASE = 'resolve:case',
  MANAGE_COUNSELORS = 'manage:counselors',
}

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  COUNSELOR: [
    Permission.VIEW_ASSIGNED_CASES,
    Permission.CREATE_NOTE,
    Permission.RESOLVE_CASE,
  ],
  SENIOR_COUNSELOR: [
    Permission.VIEW_ASSIGNED_CASES,
    Permission.VIEW_ALL_CASES,
    Permission.ASSIGN_CASES,
    Permission.CREATE_NOTE,
    Permission.RESOLVE_CASE,
  ],
  ADMIN: Object.values(Permission),
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function requirePermission(role: UserRole, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new Error('Insufficient permissions');
  }
}
