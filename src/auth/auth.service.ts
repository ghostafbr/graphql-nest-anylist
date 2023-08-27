import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthResponse } from './types/auth-response.type';
import { SigninInput, SignupInput } from './dto/inputs';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private getJwtToken(userId: string): string {
    return this.jwtService.sign({ userId });
  }

  async signUp(signupInput: SignupInput): Promise<AuthResponse> {
    const user = await this.usersService.create(signupInput);
    const token = this.getJwtToken(user.id);
    return { token, user };
  }

  async signIn(signinInput: SigninInput): Promise<AuthResponse> {
    const { email, password } = signinInput;
    const user = await this.usersService.findOneByEmail(email);

    if (!bcrypt.compareSync(password, user.password)) {
      throw new BadRequestException('Invalid credentials');
    }

    // TODO: JWT token
    const token = this.getJwtToken(user.id);

    return {
      token,
      user,
    };
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.usersService.findOneById(userId);
    if (!user.isActive)
      throw new UnauthorizedException(
        'User is not active, please contact the administrator',
      );
    delete user.password;

    return user;
  }

  revalidateToken(user: User): AuthResponse {
    const token = this.getJwtToken(user.id);
    return { token, user };
  }
}
