import { Controller, Get, Post, Inject, Param, Query, Body, UseGuards } from '@nestjs/common';
import { Repository } from 'typeorm/repository/Repository';
import { Comments } from './comment.entity';
import { Like } from 'typeorm/find-options/operator/Like';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('comments')
export class CommentsController {

  constructor(@Inject('COMMENTS_REPOSITORY')
  private readonly commentsRepository: Repository<Comments>,) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  find(@Query('where') where) {
    where = JSON.parse(where || '{}');
    console.log('Parsed where clause before mapping:', where);

    // Map `opinion_id` to `opinion`
    if (where.opinion_id) {
      where.opinion = { id: where.opinion_id }; // Map `opinion_id` to the `opinion` relationship
      delete where.opinion_id; // Remove `opinion_id` to avoid errors
    }

    console.log('Parsed where clause after mapping:', where);

    const queryBuilder = this.commentsRepository.createQueryBuilder('comments')
      .leftJoinAndSelect('comments.owner', 'owner')
      .leftJoinAndSelect('comments.opinion', 'opinion') // Join the `opinion` relationship
      .select(['comments', 'owner.id', 'owner.name', 'opinion.id'])
      .where(where);

    console.log('Generated SQL:', queryBuilder.getSql());
    return queryBuilder.getMany();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/roster')
  findRoster(@Query('where') where) {
    where = JSON.parse(where || '{}');
    if (where.roster_id) {
      where.roster = { id: where.roster_id }; 
      delete where.roster_id; 
    }

    console.log('Parsed where clause after mapping:', where);

    const queryBuilder = this.commentsRepository.createQueryBuilder('comments')
      .leftJoinAndSelect('comments.owner', 'owner')
      .leftJoinAndSelect('comments.roster', 'roster') // Join the `opinion` relationship
      .select(['comments', 'owner.id', 'owner.name', 'roster.id'])
      .where(where);

    console.log('Generated SQL:', queryBuilder.getSql());
    return queryBuilder.getMany();
  }

}
