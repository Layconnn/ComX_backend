/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('settings')
@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user settings' })
  async getSettings(@GetUser() user: any) {
    const userType = user.companyName ? 'corporate' : 'individual';
    return this.settingsService.getSettings(user.id, userType);
  }

  @Put()
  @ApiOperation({ summary: 'Update user settings' })
  async updateSettings(
    @Body() updateSettingsDto: UpdateSettingsDto,
    @GetUser() user: any,
  ) {
    const userType = user.companyName ? 'corporate' : 'individual';
    return this.settingsService.updateSettings(
      user.id,
      userType,
      updateSettingsDto,
    );
  }
}
