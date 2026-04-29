import {
  IsString,
  IsInt,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsArray,
  Min,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { ProductCategory } from '../entities/product.entity';

export class CreateProductDto {
  @ApiProperty({ example: 'Classic White Tee' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Premium cotton t-shirt' })
  @IsString()
  description: string;

  @ApiProperty({ example: 2999, description: 'Price in cents/paisa' })
  @IsInt()
  @Min(0)
  price: number;

  @ApiProperty({ enum: ProductCategory, example: ProductCategory.TOPS })
  @IsEnum(ProductCategory)
  category: ProductCategory;

  @ApiProperty({ example: 'T-Shirts', required: false })
  @IsOptional()
  @IsString()
  subcategory?: string;

  @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
  @IsOptional()
  @IsString()
  image_url?: string;

  @ApiProperty({ example: ['S', 'M', 'L', 'XL'], required: false })
  @IsOptional()
  @IsArray()
  sizes?: string[];

  @ApiProperty({ example: ['White', 'Black', 'Blue'], required: false })
  @IsOptional()
  @IsArray()
  colors?: string[];

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  in_stock?: boolean;

  @ApiProperty({ example: 100, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock_quantity?: number;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class FilterProductDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  seller_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  in_stock?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  min_price?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  max_price?: number;

  @ApiProperty({ required: false, enum: ['newest', 'price_asc', 'price_desc'] })
  @IsOptional()
  @IsString()
  sort?: string;
}