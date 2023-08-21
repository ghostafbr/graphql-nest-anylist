import { Injectable } from '@nestjs/common';
import { AuthResponse } from './types/auth-response.type';
import { User } from '../users/entities/user.entity';
import { SignupInput } from './dto/inputs/signup.input';
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService
  ) {}

  async signUp(signupInput: SignupInput): Promise<AuthResponse> {
    // TODO: Create a new user, create jwt token, return AuthResponse

    const user = await this.usersService.create(signupInput);

    const token = 'token123';

    return { token, user };
  }
}
