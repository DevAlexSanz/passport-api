import { injectable } from 'tsyringe';
import { prisma } from '@database/prisma';
import { NotFoundException } from '@exceptions/not-found.exception';
import { CreateProductCategoryDTO } from './dto';

@injectable()
export class ProductCategoryService {
  async findAll(pharmacyId: string) {
    return prisma.productCategory.findMany({
      where: {
        pharmacyId,
      },
    });
  }

  async findAllByPharmacyId(pharmacyId: string) {
    const pharmacyExists = await prisma.pharmacy.findUnique({
      where: { id: pharmacyId },
    });

    if (!pharmacyExists) {
      throw new NotFoundException('Pharmacy not found');
    }

    return prisma.productCategory.findMany({
      where: {
        pharmacyId,
      },
    });
  }

  async create(pharmacyId: string, payload: CreateProductCategoryDTO) {
    return prisma.productCategory.create({ data: { ...payload, pharmacyId } });
  }
}
