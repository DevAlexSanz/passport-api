import { inject, injectable } from 'tsyringe';
import { ProductRepository } from '@features/product/product.repository';
import { CreateProductDTO } from '@features/product/dto/create-product.dto';
import { Product } from '@generated/prisma';
import { uploadToCloudinary } from '@shared/utils/cloudinary';

@injectable()
export class ProductService {
  constructor(
    @inject(ProductRepository)
    private readonly productRepository: ProductRepository
  ) {}

  async findAll() {
    return this.productRepository.findAll();
  }

  async createProduct(
    pharmacyId: string,
    product: CreateProductDTO,
    image: Express.Multer.File
  ): Promise<Product> {
    const imageResult = await uploadToCloudinary(image, 'product-images');

    return this.productRepository.create(
      pharmacyId,
      product,
      imageResult.secure_url
    );
  }
}
