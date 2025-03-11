/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';
import { JwtAuthGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('portfolio')
@Controller('portfolio')
@UseGuards(JwtAuthGuard)
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  @ApiOperation({ summary: 'Get portfolio overview for authenticated user' })
  async getOverview(@GetUser() user: any) {
    const userType = user.companyName ? 'corporate' : 'individual';
    return this.portfolioService.getOverview(user.id, userType);
  }

  @Get('investments')
  @ApiOperation({ summary: 'Get all investments for authenticated user' })
  async getInvestments(@GetUser() user: any) {
    const userType = user.companyName ? 'corporate' : 'individual';
    return this.portfolioService.getInvestments(user.id, userType);
  }

  @Post('investments')
  @ApiOperation({ summary: 'Add a new investment to portfolio' })
  async addInvestment(
    @GetUser() user: any,
    @Body() createInvestmentDto: CreateInvestmentDto,
  ) {
    const userType = user.companyName ? 'corporate' : 'individual';
    return this.portfolioService.addInvestment(
      user.id,
      userType,
      createInvestmentDto,
    );
  }

  @Put('investments/:id')
  @ApiOperation({ summary: 'Update an investment' })
  async updateInvestment(
    @Param('id') id: string,
    @Body() updateInvestmentDto: UpdateInvestmentDto,
  ) {
    return this.portfolioService.updateInvestment(
      Number(id),
      updateInvestmentDto,
    );
  }

  @Delete('investments/:id')
  @ApiOperation({ summary: 'Delete an investment' })
  async removeInvestment(@Param('id') id: string) {
    return this.portfolioService.removeInvestment(Number(id));
  }
}
