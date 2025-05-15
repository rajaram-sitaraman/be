import { Test, TestingModule } from '@nestjs/testing';
import { Roster } from './roster.provider';

describe('Roster', () => {
  let provider: Roster;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Roster],
    }).compile();

    provider = module.get<Roster>(Roster);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
