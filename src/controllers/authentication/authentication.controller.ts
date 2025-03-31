import { Request, Response } from 'express';
import { Controller, Post, Req, Res, UseFilters } from '@nestjs/common';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { ExceptionHandler } from 'src/utils/exception-handler/exception-handler';

@Controller('api/route/Auth')
export class AuthenticationController {
    constructor(public authSrvc: AuthenticationService) { }

    @Post("Authenticate")
    @UseFilters(ExceptionHandler)
    async authenticateUser(@Req() req: Request, @Res() res: Response) {
        const resp = await this.authSrvc.AuthenticateUser(req.body.UName.trim(), req.body.Pwd.trim());
        res.json(resp);
    }

}