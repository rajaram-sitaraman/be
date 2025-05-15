import { DataSource } from 'typeorm';
import { Opinion } from './opinion.entity';

export const opinionsProviders = [
  {
    provide: 'OPINION_REPOSITORY',
    useFactory: (dataSource: DataSource) => {
      return dataSource.getRepository(Opinion);
    },
    inject: ['DATA_SOURCE'],
  },
];