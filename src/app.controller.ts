import { Controller, Get, Redirect } from '@nestjs/common';

@Controller('/')
export class AppController {
  @Get('/')
  @Redirect('/health-check', 302)
  redirectToHealthCheck() {}

  @Get('/health-check')
  healthCheck() {
    return 'OK';
  }
}
