import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Prisma } from '@prisma/client';
import { AtGuard } from '../auth/guards/at.guard';
import { RtGuard } from '../auth/guards/rt.guard';
import { AuthService } from 'src/auth/auth.service';
import { resolvedToken } from '../auth/types/index';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('signup')
  async signup(@Body() userCreateInput: Prisma.UserCreateInput) {
    const result = await this.usersService.signup(userCreateInput);

    return result;
  }

  @UseGuards(RtGuard)
  @Post('refresh')
  async refreshTokens(
    @Request() { user }: { user: { refreshToken: string } & resolvedToken },
  ) {
    const result = await this.usersService.refreshTokens(
      user,
      user.refreshToken,
    );
    return result;
  }

  @UseGuards(AtGuard)
  @Post('test')
  async test(@Request() { user }) {
    console.log(user);

    return 123;
  }
}
