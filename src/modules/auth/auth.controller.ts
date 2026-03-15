import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  @HttpCode(200)
  async signIn(
    @Body() body: SignInDto,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    return await this.authService.signIn(body, response);
  }

  @Post('sign-out')
  @HttpCode(200)
  signOut(@Res({ passthrough: true }) response: FastifyReply) {
    return this.authService.signOut(response);
  }

  @Get('verify-jwt')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  verifyJwt() {
    return { message: 'JWT is valid' };
  }
}
