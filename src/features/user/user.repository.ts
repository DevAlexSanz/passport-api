import { User } from 'generated/prisma';
import { prisma } from '@database/prisma';
import { injectable } from 'tsyringe';
import { CreateUserDto } from './dto/create-user.dto';

@injectable()
export class UserRepository {
  async findAll(): Promise<User[]> {
    return prisma.user.findMany();
  }

  async create(payload: CreateUserDto): Promise<User> {
    return prisma.user.create({
      data: {
        ...payload,
      },
    });
  }
}
