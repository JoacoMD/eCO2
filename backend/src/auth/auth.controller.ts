import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('message')
  async generateAuthMessage(@Body('address') address: string) {
    return this.authService.generateAuthMessage(address);
  }

  @Post('login')
  async verifyAndLogin(
    @Body('address') address: string,
    @Body('signature') signature: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const { accessToken, ...rest} = await this.authService.verifyAndLogin(address, signature);
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    return rest;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: { user?: { address?: string } }) {
    return { address: req.user?.address };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    return { success: true };
  }
}
