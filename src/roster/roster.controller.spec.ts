import { Test, TestingModule } from '@nestjs/testing';
import { RosterController } from './roster.controller';

describe('RosterController', () => {
  let controller: RosterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RosterController],
    }).compile();

    controller = module.get<RosterController>(RosterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
