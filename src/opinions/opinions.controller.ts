import { Body, Controller, Get, Inject, Param, Post, Query, UseGuards, Request } from '@nestjs/common';
import { Repository } from 'typeorm/repository/Repository';
import { Opinion } from './opinion.entity';
import { Like } from 'typeorm/find-options/operator/Like';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('opinions')
export class OpinionsController {

  constructor( @Inject('OPINION_REPOSITORY')
    private readonly opinionRepository: Repository<Opinion>,) {} 

  @UseGuards(JwtAuthGuard)
  @Get()
  find(@Query('q') q) { 
    if (q) return this.opinionRepository.find({ where: { title: Like(`%${q}%`) } });
    else return this.opinionRepository.find();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async findById(@Param('id') id: string) {
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      throw new Error(`Invalid ID: ${id}`);
    }

    console.log(`Fetching opinion with ID: ${parsedId}`);
    return this.opinionRepository.findOneBy({ id: parsedId });
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  save(@Body() item: Opinion, @Request() req) { 
    item.user = req.user.id.toString();
    return item.id ? this.opinionRepository.save(item) : this.opinionRepository.save(item);
  }
}
