import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { ListSuppliersDto } from './dto/list-suppliers.dto';

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(dto: ListSuppliersDto, tenantId?: string) {
    const where: Prisma.SupplierWhereInput = { deletedAt: null };
    if (dto.search) where.name = { contains: dto.search, mode: 'insensitive' };
    if (typeof dto.isActive === 'boolean') where.isActive = dto.isActive;
    if (tenantId) {
      where.OR = [
        { isPublic: true },
        { ownerTenantId: tenantId },
        { organizations: { some: { tenantId } } },
      ];
    }

    const take = dto.limit ?? 20;
    const skip = ((dto.page ?? 1) - 1) * take;

    return this.prisma.$transaction([
      this.prisma.supplier.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          categories: { include: { category: true } },
          agents: { where: { isActive: true } },
        },
      }),
      this.prisma.supplier.count({ where }),
    ]);
  }

  async findOne(id: string) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, deletedAt: null },
      include: {
        categories: { include: { category: true } },
        organizations: { include: { tenant: true } },
        agents: true,
        products: { include: { product: true } },
      },
    });
    if (!supplier) throw new NotFoundException(`Fornecedor ${id} não encontrado.`);
    return supplier;
  }

  create(dto: CreateSupplierDto) {
    const { categoryIds, agents, organizationIds, ...rest } = dto;
    return this.prisma.supplier.create({
      data: {
        ...rest,
        categories: categoryIds
          ? { create: categoryIds.map((categoryId) => ({ categoryId })) }
          : undefined,
        organizations: organizationIds
          ? { create: organizationIds.map((tenantId) => ({ tenantId })) }
          : undefined,
        agents: agents ? { create: agents } : undefined,
      },
      include: { categories: true, agents: true, organizations: true },
    });
  }

  async update(id: string, dto: UpdateSupplierDto) {
    await this.findOne(id);
    const { categoryIds, agents, organizationIds, ...rest } = dto;
    return this.prisma.supplier.update({
      where: { id },
      data: rest,
    });
  }

  async softDelete(id: string) {
    await this.findOne(id);
    return this.prisma.supplier.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
