import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { RequisitionsService } from './requisitions.service';
import { CreateRequisitionDto } from './dto/create-requisition.dto';
import { UpdateRequisitionDto } from './dto/update-requisition.dto';
import { ListRequisitionsDto } from './dto/list-requisitions.dto';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';

@ApiTags('requisitions')
@ApiBearerAuth()
@Controller('requisitions')
export class RequisitionsController {
  constructor(private readonly requisitions: RequisitionsService) {}

  @Get()
  async findAll(@Query() dto: ListRequisitionsDto, @CurrentUser() user: AuthUser) {
    const [data, total] = await this.requisitions.findAll(dto, user.sub);
    return { data, total, page: dto.page ?? 1, limit: dto.limit ?? 20 };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requisitions.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateRequisitionDto, @CurrentUser() user: AuthUser) {
    return this.requisitions.create(dto, user.sub);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRequisitionDto) {
    return this.requisitions.update(id, dto);
  }

  @Post(':id/submit')
  submit(@Param('id') id: string) {
    return this.requisitions.submit(id);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.requisitions.cancel(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.requisitions.softDelete(id);
  }
}
