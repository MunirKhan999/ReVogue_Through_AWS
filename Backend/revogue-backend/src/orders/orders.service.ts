import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    private productsService: ProductsService,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    // Validate products and calculate totals
    let subtotal = 0;
    const orderItems: Partial<OrderItem>[] = [];

    for (const item of createOrderDto.items) {
      const product = await this.productsService.findOne(item.product_id);
      
      if (!product.in_stock) {
        throw new BadRequestException(`Product ${product.name} is out of stock`);
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });
    }

    const shippingCost = 30000; // PKR 300.00 in paisa
    const tax = Math.round(subtotal * 0.05); // 5% tax
    const total = subtotal + shippingCost + tax;

    // Create order
    const order = this.ordersRepository.create({
      user_id: userId,
      subtotal,
      shipping_cost: shippingCost,
      tax,
      total,
      status: OrderStatus.PENDING,
      shipping_name: createOrderDto.shipping_info.name,
      shipping_email: createOrderDto.shipping_info.email,
      shipping_phone: createOrderDto.shipping_info.phone,
      shipping_address: createOrderDto.shipping_info.address,
      shipping_city: createOrderDto.shipping_info.city,
      shipping_postal_code: createOrderDto.shipping_info.postal_code,
      shipping_country: createOrderDto.shipping_info.country,
    });

    const savedOrder = await this.ordersRepository.save(order);

    // Create order items
    const itemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: savedOrder.id,
    }));

    await this.orderItemsRepository.save(itemsWithOrderId);

    return this.findOne(savedOrder.id);
  }

  async findAll(userId?: string): Promise<Order[]> {
    const query = this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .orderBy('order.created_at', 'DESC');

    if (userId) {
      query.where('order.user_id = :userId', { userId });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['items', 'items.product', 'user'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatus(id: string, updateStatusDto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findOne(id);
    order.status = updateStatusDto.status;
    await this.ordersRepository.save(order);
    return this.findOne(id);
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { user_id: userId },
      relations: ['items', 'items.product'],
      order: { created_at: 'DESC' },
    });
  }

  async getOrderStats(userId: string): Promise<any> {
    const orders = await this.getUserOrders(userId);
    
    return {
      total_orders: orders.length,
      total_spent: orders.reduce((sum, order) => sum + order.total, 0),
      pending: orders.filter(o => o.status === OrderStatus.PENDING).length,
      completed: orders.filter(o => o.status === OrderStatus.DELIVERED).length,
    };
  }
}
