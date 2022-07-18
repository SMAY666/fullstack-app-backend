import {DataSource} from 'typeorm';
import {User} from './src/models/User';
import {Role} from './src/models/Role';

export type DataBaseConfig = {
    username: string,
    password: string,
    host: string,
    port: number,
    name: string
}


export class DataBase {
    constructor(config: DataBaseConfig) {
        this.dataSource = new DataSource({
            type: 'postgres',
            host: config.host,
            port: config.port,
            username: config.username,
            password: config.password,
            database: config.name,
            synchronize: true,
            logging: true,
            entities: [User, Role],
            subscribers: [],
            migrations: []
        })
    }

    //-----[PRIVATE METHODS]-----

    private dataSource: DataSource

    //-----[PUBLIC METHODS]-----

    public connect(): Promise<DataSource> {
        return this.dataSource.initialize();
    }
    public disconnect(): Promise<void> {
       return  this.dataSource.destroy();
    }
}
