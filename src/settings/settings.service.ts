import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings(userId: number, userType: 'individual' | 'corporate') {
    if (userType === 'individual') {
      const user = await this.prisma.individualUser.findUnique({
        where: { id: userId },
      });
      if (!user) throw new NotFoundException('User not found');
      return {
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        // theme could be stored elsewhere if needed
      };
    } else {
      const user = await this.prisma.corporateUser.findUnique({
        where: { id: userId },
      });
      if (!user) throw new NotFoundException('User not found');
      return {
        fullName: user.companyName,
        email: user.email,
        // For corporate, we include additional fields:
        businessType: user.businessType,
        dateOfIncorporation: user.dateOfIncorporation
          .toISOString()
          .split('T')[0],
        // theme could be stored elsewhere if needed
      };
    }
  }

  async updateSettings(
    userId: number,
    userType: 'individual' | 'corporate',
    dto: UpdateSettingsDto,
  ) {
    if (userType === 'individual') {
      const names = dto.fullName.split(' ');
      const firstName = names[0];
      const lastName = names.slice(1).join(' ') || '';
      return await this.prisma.individualUser.update({
        where: { id: userId },
        data: {
          firstName,
          lastName,
          email: dto.email,
          phone: dto.phone,
          // theme can be saved if you have an extra field or table
        },
      });
    } else {
      return await this.prisma.corporateUser.update({
        where: { id: userId },
        data: {
          companyName: dto.fullName,
          email: dto.email,
          // Only update these if provided:
          businessType: dto.businessType,
          dateOfIncorporation: dto.dateOfIncorporation
            ? new Date(dto.dateOfIncorporation)
            : undefined,
        },
      });
    }
  }
}
