import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../constants';
import { resolvedToken } from '../types';
import { AuthService } from '../auth.service';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'Refreshjwt') {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConstants.RefreshSecret,
      passReqToCallback: true,
    });
  }

  // 通过返回真假来进行验证
  async validate(req: Request, payload: resolvedToken) {
    const refreshToken = (req.headers['authorization'] as string)
      .replace('Bearer', '')
      .trim();

    if (!refreshToken) throw new ForbiddenException('Refresh token malformed');

    return { ...payload, refreshToken };
  }
}
