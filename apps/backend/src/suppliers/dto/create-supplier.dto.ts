import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DayOfWeek } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateSupplierAgentDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  whatsapp?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class CreateSupplierDto {
  @ApiProperty()
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiProperty()
  @IsString()
  @Length(2, 200)
  legalName!: string;

  @ApiPropertyOptional({ description: '14 dígitos do CNPJ (sem máscara)' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{14}$/)
  cnpj?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ownerTenantId?: string;

  // Pagamento
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumOrderValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  deliveryLeadDays?: number;

  @ApiPropertyOptional({ enum: DayOfWeek, isArray: true })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEnum(DayOfWeek, { each: true })
  deliveryDays?: DayOfWeek[];

  // Relações
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  organizationIds?: string[];

  @ApiPropertyOptional({ type: [CreateSupplierAgentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSupplierAgentDto)
  agents?: CreateSupplierAgentDto[];
}
