import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IndividualUserDto } from './dto/individual-user.dto';
import { CorporateUserDto } from './dto/corporate-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUserByEmail(
    userEmail: string,
  ): Promise<IndividualUserDto | CorporateUserDto> {
    console.log('getUserByEmail called with userEmail:', userEmail);
    const individualUser = await this.prisma.individualUser.findUnique({
      where: { email: userEmail },
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
      where: { email: userEmail },
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
    console.error('User not found for email:', userEmail);
    throw new NotFoundException('User not found');
  }
}
