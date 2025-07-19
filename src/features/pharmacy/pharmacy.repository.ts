import { injectable } from 'tsyringe';
import { prisma } from '@database/prisma';

import { Status } from '@shared/constants/Status';
import { CreatePharmacy } from '@appTypes/Pharmacy';

@injectable()
export class PharmacyRepository {
  async create(pharmacy: CreatePharmacy) {
    return prisma.pharmacy.create({
      data: {
        ...pharmacy,
        status: Status.ACTIVE,
      },
    });
  }

  async findByUserId(userId: string) {
    return await prisma.pharmacy.findFirst({
      where: {
        userId,
      },
    });
  }
}
