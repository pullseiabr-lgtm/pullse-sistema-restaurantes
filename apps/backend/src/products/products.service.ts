import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ListProductsDto } from './dto/list-products.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(dto: ListProductsDto) {
    const where: Prisma.ProductWhereInput = { deletedAt: null };
    if (dto.search) {
      where.OR = [
        { name: { contains: dto.search, mode: 'insensitive' } },
        { brand: { contains: dto.search, mode: 'insensitive' } },
        { barcode: { contains: dto.search } },
      ];
    }
    if (dto.brand) where.brand = dto.brand;
    if (dto.unitOfMeasure) where.unitOfMeasure = dto.unitOfMeasure;

    const take = dto.limit ?? 20;
    const skip = ((dto.page ?? 1) - 1) * take;

    return this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
        include: { categories: { include: { category: true } } },
      }),
      this.prisma.product.count({ where }),
    ]);
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        categories: { include: { category: true } },
        suppliers: { include: { supplier: true } },
      },
    });
    if (!product) throw new NotFoundException(`Produto ${id} não encontrado.`);
    return product;
  }

  create(dto: CreateProductDto) {
    const { categoryIds, ...rest } = dto;
    return this.prisma.product.create({
      data: {
        ...rest,
        categories: categoryIds
          ? { create: categoryIds.map((categoryId) => ({ categoryId })) }
          : undefined,
      },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    const { categoryIds, ...rest } = dto;
    return this.prisma.product.update({ where: { id }, data: rest });
  }

  async softDelete(id: string) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
