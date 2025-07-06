import { MidwayConfig } from '@midwayjs/core';
import * as entities from '../entity/index';

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1751614576613_4517',
  koa: {
    port: 7001,
  },
  typeorm: {
    dataSource: {
      default: {
        type: 'sqlite',
        database: 'db.sqlite',
        synchronize: true,
        logging: false,
        entities: [...Object.values(entities)],
      },
    },
  },
} as MidwayConfig;
