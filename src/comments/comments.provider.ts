import { DataSource } from 'typeorm';
import { Comments } from './comment.entity';

export const commentsProviders = [
  {
    provide: 'COMMENTS_REPOSITORY',
    useFactory: (dataSource: DataSource) => {
      return dataSource.getRepository(Comments);
    },
    inject: ['DATA_SOURCE'],
  },
];