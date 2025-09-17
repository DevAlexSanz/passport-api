import { injectable } from 'tsyringe';
import { prisma } from '@database/prisma';
import { CreateProductDTO } from '@features/product/dto/create-product.dto';

@injectable()
export class ProductRepository {
  async findAll() {
    return prisma.product.findMany();
  }

  async create(pharmacyId: string, product: CreateProductDTO, image: string) {
    return prisma.product.create({
      data: {
        ...product,
        status: 'ACTIVE',
        pharmacyId,
        image,
      },
    });
  }
}
