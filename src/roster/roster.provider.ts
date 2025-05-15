import { DataSource } from 'typeorm';
import { Roster } from './roster.entity';

export const rostersProviders = [
  {
    provide: 'ROSTER_REPOSITORY',
    useFactory: (dataSource: DataSource) => {
      return dataSource.getRepository(Roster);
    },
    inject: ['DATA_SOURCE'],
  },
];