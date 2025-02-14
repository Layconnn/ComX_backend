import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { Public } from './public-decorator';

@Controller('auth')
export class AUthController {
  constructor(private authService: AuthService) {}

  // POST /auth/signup
  @Public()
  @Post('signup')
  signup(@Body() dto: AuthDto) {
    return this.authService.signup(dto);
  }

  // POST /auth/signin
  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('login')
  signin(@Body() dto: AuthDto) {
    return this.authService.login(dto);
  }
}
