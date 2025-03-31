import { Test, TestingModule } from '@nestjs/testing';
import { SecureUserController } from './secure-user.controller';

describe('SecureUserController', () => {
  let controller: SecureUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SecureUserController],
    }).compile();

    controller = module.get<SecureUserController>(SecureUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
