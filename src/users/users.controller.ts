import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Req,
  Patch,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Prisma } from '@prisma/client';
import { AtGuard } from '../auth/guards/at.guard';
import { RtGuard } from '../auth/guards/rt.guard';
import { AuthService } from 'src/auth/auth.service';
import { resolvedToken } from '../auth/types/index';
import { FileInterceptor } from '@nestjs/platform-express';

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

  @Post('signin')
  async signin(
    @Body() { username, password }: { username: string; password: string },
  ) {
    const result = await this.usersService.signin(username, password);

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
  @Post('logout')
  async logout(@Body() { username }) {
    return await this.usersService.logout(username);
  }

  @UseGuards(AtGuard)
  @Get('getInfo')
  async getInfo(@Request() { user }: { user: resolvedToken }) {
    const info = await this.usersService.getInfo(user.name);
    return info;
  }

  @UseGuards(AtGuard)
  @Patch('updateInfo')
  async updateInfo(
    @Request() { user }: { user: resolvedToken },
    @Body() userUpdateInput: Prisma.UserUpdateInput,
  ) {
    const result = await this.usersService.updateInfo(user.id, userUpdateInput);

    return result;
  }

  @UseGuards(AtGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() { user }: { user: resolvedToken },
  ) {
    await this.usersService.upload(user.id, file);

    return {
      status: 'success upload',
    };
  }

  @UseGuards(AtGuard)
  @Post('test')
  async test(@Request() { user }) {
    console.log(user);

    return 123;
  }
}
