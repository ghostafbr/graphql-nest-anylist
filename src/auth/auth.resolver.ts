import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { SigninInput, SignupInput } from './dto/inputs';
import { AuthResponse } from './types/auth-response.type';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Resolver(() => AuthResponse)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponse, { name: 'signUp' })
  async signUp(
    @Args('signupInput') signupInput: SignupInput,
  ): Promise<AuthResponse> {
    return this.authService.signUp(signupInput);
  }

  @Mutation(() => AuthResponse, { name: 'signIn' })
  async signIn(
    @Args('signinInput') signinInput: SigninInput,
  ): Promise<AuthResponse> {
    return this.authService.signIn(signinInput);
  }

  @Query(() => AuthResponse, { name: 'revalidate' })
  @UseGuards(JwtAuthGuard)
  revalidateToken(
    @CurrentUser(/*[ValidRolesEnum.admin]*/) user: User,
  ): AuthResponse {
    return this.authService.revalidateToken(user);
  }
}
