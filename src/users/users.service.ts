import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
// import { AuthService } from 'src/auth/auth.service';
// import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { resolvedToken } from '../auth/types/index';

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

  async refreshTokens(user: resolvedToken, token: string) {
    // console.log(user, token);

    const result = await this.authService.refreshTokens(user.id, token);

    return result;
  }
}
