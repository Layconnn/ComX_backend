import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ItemService } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@ApiTags('items')
@Controller('items')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @ApiOperation({ summary: 'Create an item' })
  @ApiResponse({ status: 201, description: 'Item created successfully.' })
  create(@Body() createItemDto: CreateItemDto) {
    return this.itemService.create(createItemDto);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  @ApiOperation({ summary: 'Retrieve all items' })
  @ApiResponse({
    status: 200,
    description: 'List of items retrieved successfully.',
  })
  findAll() {
    return this.itemService.findAll();
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific item by ID' })
  @ApiResponse({ status: 200, description: 'Item retrieved successfully.' })
  findOne(@Param('id') id: string) {
    return this.itemService.findOne(Number(id));
  }

  @HttpCode(HttpStatus.OK)
  @Put(':id')
  @ApiOperation({ summary: 'Update an item by ID' })
  @ApiResponse({ status: 200, description: 'Item updated successfully.' })
  update(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto) {
    return this.itemService.update(Number(id), updateItemDto);
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an item by ID' })
  @ApiResponse({ status: 200, description: 'Item deleted successfully.' })
  remove(@Param('id') id: string) {
    return this.itemService.remove(Number(id));
  }
}
