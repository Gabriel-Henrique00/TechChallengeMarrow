import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const typeOrmConfig = (config: ConfigService): TypeOrmModuleOptions => ({
    type:        'mysql',
    host:        config.get('database.host'),
    port:        config.get<number>('database.port'),
    username:    config.get('database.user'),
    password:    config.get('database.password'),
    database:    config.get('database.name'),
    entities:    [__dirname + '/../../**/*.model{.ts,.js}'],
    synchronize: true,
    logging:     false,
});