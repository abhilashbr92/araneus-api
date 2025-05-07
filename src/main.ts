import * as mongoose from 'mongoose';
import { Logger } from 'nestjs-pino';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';
async function bootstrap() {
  const options: any = {
    autoIndex: false
  };
  if (process.env.Mongo_URL !== '' && process.env.Mongo_URL != null) {
    await mongoose.connect(process.env.Mongo_URL, options);
    console.log("Connected to DB...");
  } else {
    console.log("Failed to connect Mongodb");
  }
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb', extended: true }));
  app.enableCors();
  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Main API Server started listening on port :${port}`);
}
bootstrap();
