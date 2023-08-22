import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ValidRolesEnum } from '../enums/valid-roles.enum';
import { User } from '../../users/entities/user.entity';

export const CurrentUser = createParamDecorator(
  (roles: ValidRolesEnum[] = [], context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const user: User = ctx.getContext().req.user;

    if (!user) {
      throw new InternalServerErrorException(
        `No user inside the request - Make sure that we used the AuthGuard before using the @CurrentUser decorator`,
      );
    }

    if (roles.length === 0) return user;

    for (const role of user.roles) {
      if (roles.includes(role as ValidRolesEnum)) return user;
    }

    throw new ForbiddenException(
      `User ${user.fullName} needs a valid role [${roles}] to perform this action`,
    );
  },
);
