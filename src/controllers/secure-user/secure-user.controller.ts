import { Controller, Post, Get, Res, Req, Put, UseGuards, UseFilters } from '@nestjs/common';
import { ObjectId } from "bson";
import { Response, Request } from 'express';
import { UserAuthGuardService } from '../../services/user-auth-guard/user-auth-guard.service';
import { UserService } from 'src/services/user/user.service';
import { ExceptionHandler } from 'src/utils/exception-handler/exception-handler';
import * as throwjs from 'throw.js';
@Controller('api/secure/Users')
@UseGuards(UserAuthGuardService)
export class SecureUserController {

    constructor(public userSrvc: UserService) { }

    @Get("List")
    @UseFilters(ExceptionHandler)
    async getUsersList(@Res() res: Response) {
        const resp = await this.userSrvc.GetAllUsers();
        res.json(resp);
    }

    @Post('Add')
    async addUser(@Req() req: Request, @Res() res: Response) {
        const resp = await this.userSrvc.CreateUser(req.body.FName, req.body.LName, req.body.UName, req.body.Admin);
        res.json(resp);
    }

    @Get("GetUserInfo")
    @UseFilters(ExceptionHandler)
    async getUserInfo(@Res() res: Response) {
        const userId: ObjectId = new ObjectId(res.locals.User.Id);
        const resp = await this.userSrvc.GetUserInfoById(userId);
        res.json(resp);
    }

    @Post("Logout")
    @UseFilters(ExceptionHandler)
    async logoutuser(@Req() req: Request, @Res() res: Response) {
        const authHeader = req.headers["authorization"];
        if (authHeader) {
            const token = authHeader.split(" ")[1];
            const userId: ObjectId = new ObjectId(res.locals.User.Id);
            const resp = await this.userSrvc.LogoutAuthenticatedUser(token, userId);
            res.json(resp);
        } else {
            res.status(403).send(new throwjs.Unauthorized());
        }
    }

    @Post('Registerface')
    async registerFace(@Req() req: Request, @Res() res: Response) {
        const resp = await this.userSrvc.SaveUserFace(req.body.UserId, req.body.Embeddings);
        res.json(resp);
    }

    @Post('Loginface')
    async loginFace(@Req() req: Request, @Res() res: Response) {
        const resp = await this.userSrvc.VerifyUserFace(req.body.Embedding);
        res.json(resp);
    }

}