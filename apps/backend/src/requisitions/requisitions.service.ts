import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RequisitionStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateRequisitionDto } from './dto/create-requisition.dto';
import { UpdateRequisitionDto } from './dto/update-requisition.dto';
import { ListRequisitionsDto } from './dto/list-requisitions.dto';

@Injectable()
export class RequisitionsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(dto: ListRequisitionsDto, userId: string) {
    const where: Prisma.RequisitionWhereInput = {
      deletedAt: null,
    };
    if (dto.storeId) where.storeId = dto.storeId;
    if (dto.status) where.status = dto.status;
    if (dto.mine) where.OR = [{ createdById: userId }, { buyerId: userId }];

    const take = dto.limit ?? 20;
    const skip = ((dto.page ?? 1) - 1) * take;

    return this.prisma.$transaction([
      this.prisma.requisition.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { store: true, items: true, _count: { select: { quotes: true } } },
      }),
      this.prisma.requisition.count({ where }),
    ]);
  }

  async findOne(id: string) {
    const req = await this.prisma.requisition.findFirst({
      where: { id, deletedAt: null },
      include: {
        store: true,
        items: { include: { product: true } },
        quotes: {
          include: {
            supplier: true,
            items: true,
          },
        },
      },
    });
    if (!req) throw new NotFoundException(`Requisição ${id} não encontrada.`);
    return req;
  }

  async create(dto: CreateRequisitionDto, userId: string) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Requisição precisa de pelo menos 1 item.');
    }

    const code = await this.generateCode();
    return this.prisma.requisition.create({
      data: {
        code,
        name: dto.name,
        notes: dto.notes,
        priority: dto.priority,
        dueDate: dto.dueDate,
        storeId: dto.storeId,
        shoppingListId: dto.shoppingListId,
        createdById: userId,
        buyerId: dto.buyerId ?? userId,
        status: RequisitionStatus.DRAFT,
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitOfMeasure: item.unitOfMeasure,
            notes: item.notes,
          })),
        },
      },
      include: { items: true },
    });
  }

  async update(id: string, dto: UpdateRequisitionDto) {
    await this.findOne(id);
    const { items, ...rest } = dto;
    return this.prisma.requisition.update({
      where: { id },
      data: rest,
    });
  }

  async submit(id: string) {
    const req = await this.findOne(id);
    if (req.status !== RequisitionStatus.DRAFT) {
      throw new BadRequestException(`Status atual ${req.status} não permite submissão.`);
    }
    return this.prisma.requisition.update({
      where: { id },
      data: { status: RequisitionStatus.OPEN, submittedAt: new Date() },
    });
  }

  async cancel(id: string) {
    await this.findOne(id);
    return this.prisma.requisition.update({
      where: { id },
      data: { status: RequisitionStatus.CANCELLED, cancelledAt: new Date() },
    });
  }

  async softDelete(id: string) {
    await this.findOne(id);
    return this.prisma.requisition.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // Geração simples de código sequencial por ano (para uso interno).
  // Em produção considere uma sequence Postgres dedicada.
  private async generateCode(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `REQ-${year}-`;
    const last = await this.prisma.requisition.findFirst({
      where: { code: { startsWith: prefix } },
      orderBy: { code: 'desc' },
    });
    const nextSeq = last ? Number(last.code.slice(prefix.length)) + 1 : 1;
    return `${prefix}${String(nextSeq).padStart(5, '0')}`;
  }
}
