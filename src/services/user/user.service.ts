import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { LoginSession } from 'src/models/login-session';
import { User } from 'src/models/user';
import { UserFace } from 'src/models/user-face';
import * as tf from '@tensorflow/tfjs';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
@Injectable()
export class UserService {

    constructor(public logger: PinoLogger) {
        this.logger.setContext(UserService.name);
    }

    async GetUserInfoById(userId: any) {
        try {
            const userInfo = await User.findOne({ "_id": userId });
            return userInfo;
        } catch (error) {
            this.logger.error(`Error occured in GetUserInfoById method : ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async LogoutAuthenticatedUser(token: any, userId: any) {
        try {
            const updatedLoginSession = await LoginSession.findOneAndUpdate({ "AccessToken": token, "Out": null, "UserId": userId },
                { Out: new Date() }, { new: true });
            if (updatedLoginSession) {
                this.logger.info("User logged out successfully");
                return true;
            } else {
                const error: any = { message: "Invalid Token" };
                this.logger.error(`Invalid token : ${JSON.stringify(error)}`);
                throw error;
            }
        } catch (error) {
            this.logger.error(`Error occured in LogoutAuthenticatedUser method : ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async CreateUser(fname: any, lname: any, uname: any) {
        try {
            const existingUser = await User.findOne({ UName: uname });
            if (!existingUser) {
                const salt: string = bcrypt.genSaltSync(10);
                const hashedPwd: string = bcrypt.hashSync('password', salt);
                const userInfo = new User({ FName: fname, LName: lname, UName: uname, Pwd: hashedPwd, Admin: false });
                const savedUser = await userInfo.save();
                this.logger.info(`User saved successfully : ${JSON.stringify(savedUser)}`);
                console.log('User created successfully');
                return savedUser;
            } else {
                throw { message: "User already exists with this username" };
            }
        } catch (error) {
            this.logger.error(`Error occured in CreateUser method : ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async GetAllUsers() {
        try {
            const usersList = await User.find({});
            return usersList;
        } catch (error) {
            this.logger.error(`Error occured in GetAllUsers method : ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async SaveUserFace(userId: string, embedding: number[]) {
        try {
            let userInfo = await UserFace.findOne({ UserId: userId });
            if (!userInfo) {
                userInfo = new UserFace({ UserId: userId, Embeddings: [] });
            }
            userInfo.embeddings.push(embedding);
            await userInfo.save();
            return { message: 'Face saved successfully' };
        } catch (error) {
            this.logger.error(`Error occured in SaveUserFace method : ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async VerifyUserFace(embedding: number[]) {
        try {
            const users = await UserFace.find({});
            const inputTensor = tf.tensor(embedding);
            let matchedUser: any;
            for (const user of users) {
                for (const storedEmbedding of user.Embeddings) {
                    const storedTensor = tf.tensor(storedEmbedding);
                    const similarity: any = tf.losses.cosineDistance(inputTensor, storedTensor, 0).arraySync();
                    if (similarity < 0.5) { // Define the similarity threshold value here
                        matchedUser = user;
                        break;
                    }
                }
                if (matchedUser) {
                    break;
                }
            }
            return { Verified: matchedUser != null, User: matchedUser };
        } catch (error) {
            this.logger.error(`Error occured in VerifyUserFace method : ${JSON.stringify(error)}`);
            throw error;
        }
    }
}
