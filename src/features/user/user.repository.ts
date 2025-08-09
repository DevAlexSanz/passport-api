import { injectable } from 'tsyringe';
import { Role } from '@appTypes/Role';
import { User } from '@generated/prisma';
import { prisma } from '@database/prisma';

@injectable()
export class UserRepository {
  async findAll(): Promise<User[]> {
    return prisma.user.findMany();
  }

  async create(payload: {
    email: string;
    password: string;
    role: Role;
    codeVerification: number;
    codeVerificationExpiresAt: Date;
  }): Promise<User> {
    return prisma.user.create({
      data: {
        ...payload,
      },
    });
  }

  async findOne(where: { id?: string; email?: string }): Promise<User | null> {
    return prisma.user.findFirst({
      where,
    });
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }
}
