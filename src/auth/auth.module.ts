import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { AtStrategy } from './strategies/at.strategy';
import { RtStrategy } from './strategies/rt.strategy';

@Module({
  imports: [JwtModule.register({})],
  providers: [AuthService, PrismaService, AtStrategy, RtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
