import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductCategory } from './entities/product.entity';
import { CreateProductDto, UpdateProductDto, FilterProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async create(sellerId: string, createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create({
      ...createProductDto,
      seller_id: sellerId,
    });
    return this.productsRepository.save(product);
  }

  async findAll(filters?: FilterProductDto): Promise<Product[]> {
    const query = this.productsRepository.createQueryBuilder('product');

    if (filters?.category) {
      query.andWhere('product.category = :category', { category: filters.category });
    }

    if (filters?.search) {
      query.andWhere(
        '(LOWER(product.name) LIKE LOWER(:search) OR LOWER(product.description) LIKE LOWER(:search))',
        { search: `%${filters.search}%` },
      );
    }

    if (filters?.seller_id) {
      query.andWhere('product.seller_id = :seller_id', { seller_id: filters.seller_id });
    }

    if (filters?.in_stock !== undefined) {
      query.andWhere('product.in_stock = :in_stock', { in_stock: filters.in_stock });
    }

    if (filters?.min_price) {
      query.andWhere('product.price >= :min_price', { min_price: filters.min_price });
    }

    if (filters?.max_price) {
      query.andWhere('product.price <= :max_price', { max_price: filters.max_price });
    }

    if (filters?.sort === 'price_asc') {
      query.orderBy('product.price', 'ASC');
    } else if (filters?.sort === 'price_desc') {
      query.orderBy('product.price', 'DESC');
    } else {
      query.orderBy('product.created_at', 'DESC');
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['seller'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(
    id: string,
    sellerId: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);

    if (product.seller_id !== sellerId) {
      throw new ForbiddenException('You can only update your own products');
    }

    Object.assign(product, updateProductDto);
    return this.productsRepository.save(product);
  }

  async remove(id: string, sellerId: string): Promise<void> {
    const product = await this.findOne(id);

    if (product.seller_id !== sellerId) {
      throw new ForbiddenException('You can only delete your own products');
    }

    await this.productsRepository.delete(id);
  }

  async getSellerProducts(sellerId: string): Promise<Product[]> {
    return this.productsRepository.find({
      where: { seller_id: sellerId },
      order: { created_at: 'DESC' },
    });
  }

  async getFeaturedProducts(limit: number = 4): Promise<Product[]> {
    return this.productsRepository.find({
      where: { in_stock: true },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  async updateProductImages(): Promise<{ updated: number; message: string }> {
    const productImages = {
      'Classic White Tee': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop&q=80',
      'Wool Beanie': 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&h=1000&fit=crop&q=80',
      'Leather Jacket': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop&q=80',
      'Slim Fit Jeans': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=1000&fit=crop&q=80',
      'Summer Dress': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=1000&fit=crop&q=80',
    };

    let updated = 0;
    for (const [productName, imageUrl] of Object.entries(productImages)) {
      const result = await this.productsRepository
        .createQueryBuilder()
        .update(Product)
        .set({ image_url: imageUrl })
        .where('name = :name', { name: productName })
        .execute();
      updated += result.affected || 0;
    }

    return {
      updated,
      message: `Updated images for ${updated} products`,
    };
  }
}