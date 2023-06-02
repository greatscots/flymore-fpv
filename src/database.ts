import { Sequelize } from 'sequelize-typescript';
import { config } from './config';

export const database = new Sequelize({
    database: config.database.database,
    dialect: 'postgres',
    username: config.database.username,
    password: config.database.password,
    host: config.database.host,
    models: [__dirname + '/models'], // or [__dirname + '/models/*.ts'] if models are in a separate directory
});
