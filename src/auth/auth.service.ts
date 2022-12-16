import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { jwtConstants } from './constants';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async updateRtHash(userId: number, rt: string) {
    const result = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRt: rt,
      },
    });
    return result;
  }

  async getUniqueByID(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    return user;
  }

  async refreshTokens(userId: number, rt: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    // console.log(user.hashedRt, rt);

    if (!user || !user.hashedRt) throw new ForbiddenException('Access Denied');

    if (user.hashedRt !== rt) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.username);

    tokens.refresh_token = rt;

    return tokens;
  }

  async getTokens(id: number, name: string) {
    const jwtPayload = {
      id,
      name,
    };
    // console.log(jwtPayload);

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: jwtConstants.AccessSecret,
        expiresIn: '1h',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: jwtConstants.RefreshSecret,
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }
}
