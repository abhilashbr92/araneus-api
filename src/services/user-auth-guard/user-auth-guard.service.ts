import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as throwjs from 'throw.js';
import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { LoginSession } from 'src/models/login-session';

@Injectable()
export class UserAuthGuardService implements CanActivate {

    constructor(public logger: PinoLogger) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        return new Promise(async (resolve, reject) => {
            const request = context.switchToHttp().getRequest();
            const response = context.switchToHttp().getResponse();
            const result: any = await this.verifyJWT(request, response);
            if (!result.Valid) {
                response.status(result.Code).send(new throwjs.Unauthorized());
            }
            resolve(result.Valid);
        });
    }

    private async verifyJWT(req: Request, res: Response) {
        try {
            const authHeader = req.headers["authorization"];
            if (authHeader) {
                const token = authHeader.split(" ")[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
                const result = await this.CheckLoginSession(token, decoded, res);
                return result;
            } else {
                return {
                    Valid: false,
                    Code: 403
                };
            }
        } catch (error) {
            this.logger.error(`Error occured in verifyJWT method : ${JSON.stringify(error)}`);
            return {
                Valid: false,
                Code: 403
            };
        }
    }

    private async CheckLoginSession(token: any, jwtInfo: any, res: any) {
        try {
            const loginSession = await LoginSession.findOne({
                AccessToken: token, UserId: jwtInfo.UserId,
                Out: null
            });
            if (loginSession == null) {
                return {
                    Valid: false,
                    Code: 403
                };
            } else {
                res.locals.User = {
                    Id: jwtInfo.UserId
                };
                return {
                    Valid: true
                };
            }
        } catch (error) {
            this.logger.error(`Error occured in CheckLoginSession method : ${JSON.stringify(error)}`);
            throw error;
        }
    }

}
