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

  async createWithAccount(payload: {
    email: string;
    account: {
      provider: string;
      providerAccountId: string;
      accessToken: string;
      refreshToken: string;
    };
  }): Promise<User> {
    return prisma.user.create({
      data: {
        email: payload.email,
        isVerified: true,
        role: 'USER',
        accounts: {
          create: payload.account,
        },
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
