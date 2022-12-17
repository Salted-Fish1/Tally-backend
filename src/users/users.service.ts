import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma.service';
import { resolvedToken } from '../auth/types/index';
import * as fs from 'fs';
import * as dayjs from 'dayjs';
import * as path from 'path';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async signup(userCreateInput: Prisma.UserCreateInput) {
    const user = await this.prisma.user.create({
      data: userCreateInput,
    });

    const tokens = await this.authService.getTokens(user.id, user.username);
    console.log(tokens);

    await this.authService.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  }

  async signin(username: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) throw new ForbiddenException('Access Denied');

    if (user.password !== password)
      throw new ForbiddenException('Wrong password');

    const tokens = await this.authService.getTokens(user.id, user.username);

    await this.authService.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  }

  async refreshTokens(user: resolvedToken, token: string) {
    // console.log(user, token);

    const result = await this.authService.refreshTokens(user.id, token);

    return result;
  }

  async logout(username: string) {
    const user = await this.prisma.user.updateMany({
      where: {
        username: username,
        hashedRt: {
          not: null,
        },
      },
      data: {
        hashedRt: null,
      },
    });

    return user;
  }

  async getInfo(username: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    return user;
  }

  async updateInfo(userId: number, userUpdateInput: Prisma.UserUpdateInput) {
    const result = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: userUpdateInput,
    });

    return result;
  }

  async upload(userId: number, file: Express.Multer.File) {
    let filePath = path.join('upload', dayjs().format('YYYY-MM-DD'));

    fs.mkdir(filePath, { recursive: true }, (err) => {
      if (err) throw err;
    });

    filePath = path.join(filePath, file.originalname);

    fs.writeFileSync(filePath, file.buffer);

    this.updateInfo(userId, { avatar: filePath });
  }
}
