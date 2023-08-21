import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { SignupInput } from './dto/inputs/signup.input';
import { AuthResponse } from './types/auth-response.type';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponse, { name: 'signUp' })
  async signUp(
    @Args('signupInput') signupInput: SignupInput,
  ): Promise<AuthResponse> {
    return this.authService.signUp(signupInput);
  }

  /*@Mutation(() => String, {name: 'signIn'})
  async signIn(): Promise<User> {
    return this.authService.signIn();
  }

  @Query(, {name: 'revalidate'})
  async revalidate(): Promise<User> {
    return this.authService.revalidateToken();
  }*/
}
