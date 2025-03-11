/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';

@Injectable()
export class PortfolioService {
  constructor(private prisma: PrismaService) {}

  async getOverview(userId: number, userType: 'individual' | 'corporate') {
    let portfolio;
    if (userType === 'individual') {
      portfolio = await this.prisma.portfolio.findUnique({
        where: { individualUserId: userId },
        include: { investments: true },
      });
    } else {
      portfolio = await this.prisma.portfolio.findUnique({
        where: { corporateUserId: userId },
        include: { investments: true },
      });
    }
    if (!portfolio) throw new NotFoundException('Portfolio not found');
    return portfolio;
  }

  async getInvestments(userId: number, userType: 'individual' | 'corporate') {
    const portfolio = await this.getOverview(userId, userType);
    return portfolio.investments;
  }

  /**
   * Approach 2: Automatically create a portfolio if it doesn't exist,
   * then add the new investment.
   */
  async addInvestment(
    userId: number,
    userType: 'individual' | 'corporate',
    createInvestmentDto: CreateInvestmentDto,
  ) {
    let portfolio;

    // Attempt to find an existing portfolio
    if (userType === 'individual') {
      portfolio = await this.prisma.portfolio.findUnique({
        where: { individualUserId: userId },
      });
      // If none, create one
      if (!portfolio) {
        portfolio = await this.prisma.portfolio.create({
          data: { individualUserId: userId },
        });
      }
    } else {
      portfolio = await this.prisma.portfolio.findUnique({
        where: { corporateUserId: userId },
      });
      if (!portfolio) {
        portfolio = await this.prisma.portfolio.create({
          data: { corporateUserId: userId },
        });
      }
    }

    // Now we can safely add an investment to the newly created or existing portfolio
    const investment = await this.prisma.investment.create({
      data: {
        portfolioId: portfolio.id,
        ...createInvestmentDto,
      },
    });
    return investment;
  }

  async updateInvestment(
    investmentId: number,
    updateInvestmentDto: UpdateInvestmentDto,
  ) {
    const investment = await this.prisma.investment.update({
      where: { id: investmentId },
      data: updateInvestmentDto,
    });
    return investment;
  }

  async removeInvestment(investmentId: number) {
    const investment = await this.prisma.investment.delete({
      where: { id: investmentId },
    });
    return investment;
  }
}
