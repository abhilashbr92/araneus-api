import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { LoggerModule } from 'nestjs-pino';
import { APP_FILTER } from '@nestjs/core';
import { LoggerStreams } from './logger-config';
import { ExceptionHandler } from './utils/exception-handler/exception-handler';
import { AuthenticationController } from './controllers/authentication/authentication.controller';
import { AuthenticationService } from './services/authentication/authentication.service';
import { SecureUserController } from './controllers/secure-user/secure-user.controller';
import { UserService } from './services/user/user.service';
import { UserAuthGuardService } from './services/user-auth-guard/user-auth-guard.service';
const path = require("path");
const multistream = require('pino-multi-stream').multistream;

@Module({
  imports: [ConfigModule.forRoot(),
  LoggerModule.forRoot({
    pinoHttp: [
      {
        level: 'trace',
        autoLogging: true,
        genReqId: function (req) { return uuidv4(); },
      }, multistream(LoggerStreams)
    ]
  })],
  controllers: [AuthenticationController, SecureUserController],
  providers: [{
    provide: APP_FILTER,
    useClass: ExceptionHandler
  }, AuthenticationService, UserService, UserAuthGuardService],
})
export class AppModule { }
