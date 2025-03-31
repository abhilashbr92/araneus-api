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

    private async CreateUsers() {
        try {
            const salt: string = bcrypt.genSaltSync(10);
            const hashedPwd: string = bcrypt.hashSync('password', salt);
            const usersList = [
                { FName: "Umesh", LName: "Yarlagadda", UName: "umeshyaralagadda", Pwd: hashedPwd, Admin: true },
                { FName: "Abhilash", LName: "Reddy", UName: "abhilashreddy", Pwd: hashedPwd },
                { FName: "Balaraju", LName: "Nimmakayala", UName: "balarajunimmakayala", Pwd: hashedPwd },
            ];
            for (let i = 0; i < usersList.length; i++) {
                let userInfo = JSON.parse(JSON.stringify(usersList[i]));
                userInfo = new User(userInfo);
                const savedUser = await userInfo.save();
                this.logger.info(`User saved successfully : ${JSON.stringify(savedUser)}`);
            }
            console.log('Users created successfully');
            return true;
        } catch (error) {
            this.logger.error(`Error occured in CreateUsers method : ${JSON.stringify(error)}`);
            throw error;
        }
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
}
