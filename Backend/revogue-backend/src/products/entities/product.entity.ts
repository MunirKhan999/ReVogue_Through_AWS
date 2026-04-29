import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ProductCategory {
  TOPS = 'Tops',
  BOTTOMS = 'Bottoms',
  OUTERWEAR = 'Outerwear',
  DRESSES = 'Dresses',
  FOOTWEAR = 'Footwear',
  ACCESSORIES = 'Accessories',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('int')
  price: number;

  @Column({
    type: 'enum',
    enum: ProductCategory,
  })
  category: ProductCategory;

  @Column({ nullable: true })
  subcategory: string;

  @Column({ type: 'text', nullable: true })
  image_url: string;

  @Column('uuid')
  seller_id: string;

  @Column({ default: true })
  in_stock: boolean;

  @Column('simple-array', { nullable: true })
  sizes: string[];

  @Column('simple-array', { nullable: true })
  colors: string[];

  @Column({ default: 0 })
  stock_quantity: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'seller_id' })
  seller: User;
}