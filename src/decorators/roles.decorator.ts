import { SetMetadata } from '@nestjs/common';
import { UserEnum } from '../users/users.model';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserEnum[]) => SetMetadata(ROLES_KEY, roles);
