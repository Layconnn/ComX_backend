import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemService {
  constructor(private prisma: PrismaService) {}

  async create(createItemDto: CreateItemDto) {
    return await this.prisma.item.create({
      data: createItemDto,
    });
  }

  async findAll() {
    return await this.prisma.item.findMany();
  }

  async findOne(id: number) {
    const item = await this.prisma.item.findUnique({
      where: { id },
    });
    if (!item) {
      throw new NotFoundException(`Item with id ${id} not found`);
    }
    return item;
  }

  async update(id: number, updateItemDto: UpdateItemDto) {
    await this.findOne(id);
    return this.prisma.item.update({
      where: { id },
      data: updateItemDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.item.delete({
      where: { id },
    });
  }
}
