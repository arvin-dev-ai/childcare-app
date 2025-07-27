import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find({ relations: ['role'] });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: [
        'role',
        'role.permissions',
        'centerMemberships',
        'centerMemberships.center',
        'centerMemberships.role',
        'centerMemberships.role.permissions',
      ],
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password') // Explicitly select the password field
      .where('user.email = :email', { email })
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.centerMemberships', 'centerMemberships')
      .leftJoinAndSelect('centerMemberships.center', 'center')
      .leftJoinAndSelect('centerMemberships.role', 'centerRole')
      .getOne();
  }

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const { email, password, roleId, ...rest } = createUserDto;

    const existingUser = await this.usersRepository.findOneBy({ email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userToCreate: Partial<User> = {
      ...rest,
      email,
      password: hashedPassword,
    };

    if (roleId) {
      const role = await this.rolesRepository.findOneBy({ id: roleId });
      if (!role) {
        throw new NotFoundException(`Role with ID "${roleId}" not found`);
      }
      userToCreate.role = role;
    }

    const newUser = this.usersRepository.create(userToCreate);
    const savedUser = await this.usersRepository.save(newUser);

    const { password: _, ...result } = savedUser;
    return result;
  }
}
