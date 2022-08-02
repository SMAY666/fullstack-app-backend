import {DataSource} from 'typeorm';
import {Password} from './utils';
import {Role, Employee} from './models';
import { resolve } from 'path';


export type DataBaseConfig = {
    username: string,
    password: string,
    host: string,
    port: number,
    name: string
}

export type MainAdminConfig = {
    login: string,
    password: string
}

export class DataBase {
    constructor(config: DataBaseConfig, mainAdminConfig: MainAdminConfig) {
        mainAdminConfig.password = Password.calculateHash(mainAdminConfig.password);
        this.dataSource = new DataSource({
            type: 'postgres',
            host: config.host,
            port: config.port,
            username: config.username,
            password: config.password,
            database: config.name,
            synchronize: true,
            logging: true,
            entities: [Role, Employee],
            subscribers: [],
            migrations: []
        })
        this.mainAdminConfig = mainAdminConfig
    }

    //-----[PRIVATE PROPERTIES]-----

    private dataSource: DataSource
    private mainAdminConfig: MainAdminConfig


    //-----[PRIVATE METHODS]-----

    private checkMainAdmin(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            Employee.findOneBy({role: {
                name: 'mainAdmin'
            }})
            .then((mainAdmin) => {
                if (!mainAdmin) {
                    return this.createMainAdmin();
                }
                else {
                    return this.updateMainAdmin(mainAdmin)
                }
            })
        })
    }

    private createMainAdmin(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const newMainAdmin = Employee.create({
                firstName: '',
                middleName: '',
                lastName: '',
                dateOfBorn: '',
                post: '',
                salary: 0,
                role: {
                    name: 'mainAdmin'
                },
                email: this.mainAdminConfig.login,
                passwordHash: Password.calculateHash(this.mainAdminConfig.password)
            })
            newMainAdmin.save()
                .then(() => resolve())
                .catch(error => reject(new Error(`Failed to create main admin account: ${error.message}`)));
        })
    }

    private updateMainAdmin(mainAdmin: Employee): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const updated = {
                passwordHash: this.mainAdminConfig.password
            }

            if (mainAdmin.email != this.mainAdminConfig.login) {
                Object.assign(updated, {login: this.mainAdminConfig.login})
            }

            Employee.update({id: mainAdmin.id}, updated)
                .then(() => resolve())
                .catch(error => reject(new Error(`Failed to create main admin account: ${error.message}`)))
        })
    }

    //-----[PUBLIC METHODS]-----

    public connect(): Promise<DataSource> {
        return this.dataSource.initialize();
    }
    public disconnect(): Promise<void> {
       return  this.dataSource.destroy();
    }
}
