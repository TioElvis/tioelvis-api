import { Model } from 'mongoose';
import { compare } from 'bcrypt';
import { FastifyReply } from 'fastify';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';

import { SignInDto } from './dto/sign-in.dto';
import { User, UserDocument } from './user.schema';

import { MAX_COOKIE_AGE } from 'src/lib/constants';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async signIn({ username, password }: SignInDto, response: FastifyReply) {
    const user = await this.userModel.findOne({ username }).exec();

    const isValidPassword = user
      ? await compare(password, user.password)
      : false;

    if (!user || !isValidPassword) {
      throw new BadRequestException('Invalid username or password.');
    }

    const jwt = this.jwtService.sign({ id: user._id.toString() });

    response.setCookie('jwt', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: MAX_COOKIE_AGE,
      path: '/',
      domain:
        process.env.NODE_ENV === 'production'
          ? `.${this.configService.get<string>('WEB_DOMAIN')}`
          : 'localhost',
      signed: true,
    });

    return { message: 'Signed in successfully.' };
  }

  signOut(response: FastifyReply) {
    response.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      domain:
        process.env.NODE_ENV === 'production'
          ? `.${this.configService.get<string>('WEB_DOMAIN')}`
          : 'localhost',
      signed: true,
    });

    return { message: 'Signed out successfully.' };
  }
}
