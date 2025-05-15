import { Body, Controller, Get, Inject, Param, Post, Query, UseGuards, Request } from '@nestjs/common';
import { Roster } from './roster.entity';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Opinion } from 'src/opinions/opinion.entity';
import { User } from 'src/users/user.entity';

@Controller('roster')
export class RosterController {

  constructor(@Inject('ROSTER_REPOSITORY')
  private readonly rosterRepository: Repository<Roster>,
    @Inject('USER_REPOSITORY')
    private readonly userRepository: Repository<User>,) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  async find(@Query('q') q, @Request() req) {
    let rosters = await this.rosterRepository.find({
      where: [
        { user1: { id: req.user.id } },
        { user2: { id: req.user.id } }
      ],
      relations: ['user1', 'user2'],
    });
    rosters = await Promise.all(rosters.map(async (roster) => {
      if (roster.user2.id === req.user.id) {
        const otherUser = await this.userRepository.findOne({ where: { id: roster.user1.id } });
        roster.otherguysname = otherUser!.name;
      }
      return roster;
    }));
    return rosters;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async findById(@Param('id') id: string, @Request() req) {
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      throw new Error(`Invalid ID: ${id}`);
    }

    console.log(`Fetching roster with ID: ${parsedId}`);

    // Use `findOne` with relations to load `user1` and `user2`
    const roster = await this.rosterRepository.findOne({
      where: { id: parsedId },
      relations: ['user1', 'user2'], // Load the related `user1` and `user2` entities
    });

    if (!roster) {
      throw new Error(`Roster not found with ID: ${parsedId}`);
    }

    if(roster.user2.id !== req.user.id && roster.user1.id !== req.user.id) {
      throw new Error(`You are not authorized to view this roster`); 
    }

    return roster;
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async save(@Body() user: User, @Request() req) {
    const item = new Roster();
    item.otherguysname = user.name;

    const roster1 = await this.rosterRepository.findOne({ where: { user1: { id: req.user.id }, user2: { id: user.id } } });
    if (roster1) return roster1;
    const roster2 = await this.rosterRepository.findOne({ where: { user2: { id: req.user.id }, user1: { id: user.id } } });
    if (roster2) return roster2;


    item.user1 = req.user.id.toString();
    item.user2 = { id: parseInt(user.id.toString(), 10) } as any;
    return item.id ? this.rosterRepository.save(item) : this.rosterRepository.save(item);
  }
}
