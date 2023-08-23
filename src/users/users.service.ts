import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserInput, UpdateUserInput } from './dto/';
import { User } from './entities/user.entity';
import { SignupInput } from '../auth/dto/inputs/signup.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ValidRolesEnum } from '../auth/enums/valid-roles.enum';

@Injectable()
export class UsersService {
  private logger = new Logger('UsersService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(signUpInput: SignupInput): Promise<User> {
    try {
      const user = this.userRepository.create({
        ...signUpInput,
        password: bcrypt.hashSync(signUpInput.password, 10),
      });
      return await this.userRepository.save(user);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll(roles: ValidRolesEnum[]): Promise<User[]> {
    if (roles.length === 0)
      return this.userRepository.find(/*{
      TODO: Not needed because we implemented lazy on lastUpdatedBy property on User entity file
        relations: {
          lastUpdatedBy: true,
        },
      }*/);

    // ??? We have roles [ 'admin', 'superUser' ]
    return this.userRepository
      .createQueryBuilder()
      .andWhere('ARRAY[roles] && ARRAY[:...roles]')
      .setParameter('roles', roles)
      .getMany();
  }

  async findOneByEmail(email: string): Promise<User> {
    try {
      return await this.userRepository.findOneByOrFail({ email });
    } catch (error) {
      throw new NotFoundException(`${email} not found`);
      /*this.handleDBErrors({
        code: 'error-001',
        detail: `${email} not found`,
      });*/
    }
  }

  async findOneById(id: string): Promise<User> {
    try {
      return await this.userRepository.findOneByOrFail({ id });
    } catch (error) {
      throw new NotFoundException(`${id} not found`);
    }
  }

  async update(
    id: string,
    updateUserInput: UpdateUserInput,
    updateBy: User,
  ): Promise<User> {
    try {
      const user = await this.userRepository.preload({
        ...updateUserInput,
        id,
      });
      user.lastUpdatedBy = updateBy;
      return await this.userRepository.save(user);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async block(id: string, adminUser: User): Promise<User> {
    const user = await this.findOneById(id);
    user.isActive = false;
    user.lastUpdatedBy = adminUser;
    return await this.userRepository.save(user);
  }

  handleDBErrors(error: any): never {
    this.logger.error(error);
    if (error.code === '23505') {
      throw new BadGatewayException(error.detail.replace('key', ''));
    }

    throw new InternalServerErrorException('Please check server logs');
  }
}
