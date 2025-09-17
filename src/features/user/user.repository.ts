import { injectable } from 'tsyringe';
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
    roleId: string;
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
    roleId: string;
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
        roleId: payload.roleId,
        accounts: {
          create: payload.account,
        },
      },
    });
  }

  async findOne(where: { id?: string; email?: string }) {
    return prisma.user.findFirst({
      where,
      include: { role: true, pharmacy: true },
    });
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }
}
