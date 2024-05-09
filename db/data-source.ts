import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv'

config()
export const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: Boolean(process.env.DB_SYNCHRONIZE) || true,
    logging: ["query", "error"],
    entities: ['dist/**/*.entity{.ts,.js}'],
    migrations: ['dist/db/migrations/*{.ts,.js}'],
    subscribers: ['dist/db/subscribers/*{.ts,.js}'],
};

const dataSource = new DataSource(dataSourceOptions);

dataSource.initialize();

export default dataSource
