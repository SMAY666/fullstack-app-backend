import {DataSource} from 'typeorm';
import {User, Role, Company, Employee} from './models';

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
            entities: [User, Role, Company, Employee],
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
