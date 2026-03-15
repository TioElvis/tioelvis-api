import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { MAX_JWT_AGE } from './lib/constants';
import { JwtStrategy } from './strategies/jwt.strategy';

import { AppController } from './app.controller';

import { AuthModule } from './modules/auth/auth.module';
import { GeminiModule } from './modules/gemini/gemini.module';
import { GithubModule } from './modules/github/github.module';
import { ProjectModule } from './modules/project/project.module';
import { SectionModule } from './modules/section/section.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('DB_URI'),
        dbName: config.get<string>('DB_NAME'),
      }),
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: MAX_JWT_AGE },
      }),
    }),
    PassportModule,
    AuthModule,
    ProjectModule,
    SectionModule,
    GithubModule,
    GeminiModule,
  ],
  controllers: [AppController],
  providers: [JwtStrategy],
})
export class AppModule {}
