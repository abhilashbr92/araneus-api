import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { LoginSession } from 'src/models/login-session';
import { User } from 'src/models/user';
import { UserFace } from 'src/models/user-face';
import * as tf from '@tensorflow/tfjs';
import * as bcrypt from 'bcryptjs';
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

    async CreateUser(fname: any, lname: any, uname: any, admin: boolean) {
        try {
            const existingUser = await User.findOne({ UName: uname });
            if (!existingUser) {
                const salt: string = bcrypt.genSaltSync(10);
                const hashedPwd: string = bcrypt.hashSync('password', salt);
                const userInfo = new User({ FName: fname, LName: lname, UName: uname, Pwd: hashedPwd, Admin: admin });
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

    async SaveUserFace(userId: string, embeddings: any) {
        try {
            const userFace = new UserFace({ UserId: userId, Embeddings: embeddings });
            const savedFace = await userFace.save();
            const savedUser = await User.findOneAndUpdate({ "_id": userId }, { FaceReg: true }, { new: true });
            return savedUser;
        } catch (error) {
            this.logger.error(`Error occured in SaveUserFace method : ${JSON.stringify(error)}`);
            throw error;
        }
    }

    normalize(embedding: number[]): number[] {
        const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        return embedding.map(val => val / norm);
    }

    async VerifyUserFace(embedding: number[]) {
        try {
            let matchedUser: any;
            let matchedUserFace: any;
            const usersFaceList = await UserFace.find({});
            const inputEmbedding = this.normalize(embedding);
            for (const userFace of usersFaceList) {
                let bestScore = -1;
                for (const storedEmbedding of userFace.Embeddings) {
                    const normalizedStoredEmbedding = this.normalize(storedEmbedding);
                    const score = this.cosineSimilarity(inputEmbedding, normalizedStoredEmbedding);
                    console.log(`Score: ${score}`);
                    bestScore = Math.max(bestScore, score);
                }
                console.log(`Best score for user ${userFace.UserId}: ${bestScore}`);
                if (bestScore > 0.8) {
                    matchedUserFace = userFace;
                    break;
                }
            }
            if (matchedUserFace != null) {
                matchedUser = await User.findOne({ "_id": matchedUserFace.UserId });
            }
            return { Verified: matchedUser != null, User: matchedUser != null ? matchedUser.UName : null };
        } catch (error) {
            this.logger.error(`Error occured in VerifyUserFace method : ${JSON.stringify(error)}`);
            throw error;
        }
    }

    cosineSimilarity(a: number[], b: number[]) {
        if (a.length !== b.length) {
            console.log("Vectors must be of the same length");
            return -1;
        }
        const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
        const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
        const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
        return dot / (normA * normB);
    }

}
