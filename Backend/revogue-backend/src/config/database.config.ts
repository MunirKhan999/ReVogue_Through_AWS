import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => {
    const isProduction = process.env.NODE_ENV === 'production';
    const useSsl = process.env.DB_SSL === 'true';

    return {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'revogue',
      autoLoadEntities: true,
      synchronize:
        !isProduction && process.env.DB_SYNCHRONIZE !== 'false',
      logging: process.env.NODE_ENV === 'development',
      ssl: useSsl ? { rejectUnauthorized: false } : false,
      extra: useSsl
        ? { ssl: { rejectUnauthorized: false } }
        : undefined,
    };
  },
);
