import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import type { FastifyRequest } from 'fastify';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: FastifyRequest) => {
          const signedCookie = request.cookies['jwt'];

          if (!signedCookie) return null;

          const unsignedResult = request.unsignCookie(signedCookie);

          if (unsignedResult.valid) return unsignedResult.value;

          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || '',
    });
  }

  validate(payload: { id: string }) {
    if (!payload.id) {
      return null;
    }

    return { id: payload.id };
  }
}
