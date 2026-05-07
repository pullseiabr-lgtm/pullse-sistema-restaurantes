import { ApiPropertyOptional } from '@nestjs/swagger';
import { RequisitionStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListRequisitionsDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 20, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  storeId?: string;

  @ApiPropertyOptional({ enum: RequisitionStatus })
  @IsOptional()
  @IsEnum(RequisitionStatus)
  status?: RequisitionStatus;

  @ApiPropertyOptional({ description: 'Filtra somente as do usuário autenticado' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  mine?: boolean;
}
