/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IndividualUserDto } from './dto/individual-user.dto';
import { CorporateUserDto } from './dto/corporate-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUserById(
    userId: number,
  ): Promise<IndividualUserDto | CorporateUserDto> {
    console.log('getUserById called with userId:', userId);
    const individualUser = await this.prisma.individualUser.findUnique({
      where: { id: userId },
    });
    if (individualUser) {
      return new IndividualUserDto({
        id: individualUser.id,
        firstName: individualUser.firstName,
        lastName: individualUser.lastName,
        phone: individualUser.phone,
        email: individualUser.email,
        createdAt: individualUser.createdAt,
        updatedAt: individualUser.updatedAt,
      });
    }
    const corporateUser = await this.prisma.corporateUser.findUnique({
      where: { id: userId },
    });
    if (corporateUser) {
      return new CorporateUserDto({
        id: corporateUser.id,
        companyName: corporateUser.companyName,
        businessType: corporateUser.businessType,
        dateOfIncorporation: corporateUser.dateOfIncorporation,
        email: corporateUser.email,
        createdAt: corporateUser.createdAt,
        updatedAt: corporateUser.updatedAt,
      });
    }
    console.error('User not found for id:', userId);
    throw new NotFoundException('User not found');
  }
}
