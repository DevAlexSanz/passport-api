import { prisma } from '@database/prisma';

export class AccountRepository {
  async findByProviderAndProviderAccountId(
    provider: string,
    providerAccountId: string
  ) {
    return await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
      include: { user: true },
    });
  }
}
