import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserJwtDto } from 'src/dto/user.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET_KEY,
      ignoreExpiration: false,
    });
  }

  async validate(payload: any): Promise<UserJwtDto> {
    if (!payload.id || !payload.userName) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const result: UserJwtDto = {
      id: payload.id,
      userName: payload.userName,
      isAdmin: payload.isAdmin,
    };
    return result;
  }
}
