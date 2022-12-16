import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../constants';
import { resolvedToken } from '../types';
import { AuthService } from '../auth.service';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'Accessjwt') {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConstants.AccessSecret,
    });
  }

  // 通过返回真假来进行验证
  async validate(payload: resolvedToken) {
    const user = await this.authService.getUniqueByID(payload.id);
    // console.log(payload);

    if (user.username === payload.name) {
      return payload;
    } else {
      return false;
    }
  }
}
