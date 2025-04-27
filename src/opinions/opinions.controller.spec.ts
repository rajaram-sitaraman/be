import { Test, TestingModule } from '@nestjs/testing';
import { OpinionsController } from './opinions.controller';

describe('OpinionsController', () => {
  let controller: OpinionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpinionsController],
    }).compile();

    controller = module.get<OpinionsController>(OpinionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
