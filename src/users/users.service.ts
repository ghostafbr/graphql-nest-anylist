import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  Logger, NotFoundException
} from "@nestjs/common";
import { CreateUserInput, UpdateUserInput } from './dto/';
import { User } from './entities/user.entity';
import { SignupInput } from '../auth/dto/inputs/signup.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

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

  async findAll(): Promise<User[]> {
    return [];
  }

  findOne(id: string): Promise<User> {
    throw new Error('Method not implemented.');
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

  update(id: number, updateUserInput: UpdateUserInput) {
    return `This action updates a #${id} user`;
  }

  async block(id: string): Promise<User> {
    throw new Error('Method not implemented.');
  }

  handleDBErrors(error: any): never {
    this.logger.error(error);
    if (error.code === '23505') {
      throw new BadGatewayException(error.detail.replace('key', ''));
    }

    throw new InternalServerErrorException('Please check server logs');
  }
}
