import { registerEnumType } from '@nestjs/graphql';

export enum ValidRolesEnum {
  admin = 'admin',
  user = 'user',
  superUser = 'superUser',
}

registerEnumType(ValidRolesEnum, { name: 'ValidRolesEnum', description: 'Valid roles for users' }); // 👈 register enum with GraphQL
