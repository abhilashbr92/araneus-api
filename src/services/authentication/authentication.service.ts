import { Injectable } from '@nestjs/common';
import * as throwjs from 'throw.js';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/models/user';
import { PinoLogger } from 'nestjs-pino';
import * as jwt from 'jsonwebtoken';
import { LoginSession } from 'src/models/login-session';
@Injectable()
export class AuthenticationService {

    constructor(public logger: PinoLogger) {
        this.logger.setContext(AuthenticationService.name);
    }

    async AuthenticateUser(userName: any, password: string) {
        try {
            const matchedRecord = await this.GetUserRecordWithLoginCredentials(userName);
            console.log("Valid Account");
            const validPwd = await this.CheckUserPassword(password, matchedRecord.Pwd);
            if (!validPwd) {
                console.log("Password doesn't match");
                throw new throwjs.Unauthorized();
            } else {
                console.log("Username and password matched");
                const loginResponse = await this.GetLoginResponse(matchedRecord);
                return loginResponse;
            }
        } catch (error) {
            this.logger.error(`Error occured in AuthenticateUser method : ${JSON.stringify(error)}`);
            throw error;
        }
    }

    private async GetUserRecordWithLoginCredentials(username: any) {
        try {
            const matchedRecord: any = await User.findOne({ "UName": username }).select('+Pwd');
            if (matchedRecord == null) {
                console.log("No record found with the given credentials");
                throw new throwjs.Unauthorized();
            } else {
                console.log("Found User record with email/phone credentials");
                return matchedRecord;
            }
        } catch (error) {
            this.logger.error(`Error occured in GetUserRecordWithLoginCredentials method : ${JSON.stringify(error)}`);
            throw error;
        }
    }

    private async CheckUserPassword(enteredPwd: any, matchedRecordPwd: any) {
        return new Promise(async (resolve, reject) => {
            bcrypt.compare(enteredPwd, matchedRecordPwd, async (err, res) => {
                if (err) {
                    this.logger.error(`bcrypt password compare error. : ${JSON.stringify(err)}`);
                    reject(new throwjs.Unauthorized());
                } else {
                    resolve(res);
                }
            });
        });
    }

    private async GetLoginResponse(userInfo: any) {
        try {
            const payload = { UserId: userInfo._id };
            let accessToken: string = jwt.sign(payload, process.env.JWT_SECRET_KEY); // No 'expiresIn' set

            let loginSession: any = {
                UserId: userInfo._id,
                AccessToken: accessToken,
                In: new Date()
            };
            loginSession = new LoginSession(loginSession);
            const savedLoginSession = await loginSession.save();
            return {
                AccessToken: accessToken,
                User: userInfo
            };
        } catch (error) {
            this.logger.error(`Error occured in GetLoginResponse method : ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async AddFace(faceData: any) {
        try {
            console.log("Adding face data to user record");
            console.log(faceData);
            return true;
        } catch (error) {
            this.logger.error(`Error occured in AddFace method : ${JSON.stringify(error)}`);
            throw error;
        }
    }
}
