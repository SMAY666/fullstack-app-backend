// eslint linebreak-style: ["error", "windows"]

import {DataSource} from 'typeorm';
import {Password} from './utils';
import {Role, Employee, Event, Customer, Document} from './models';


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
            entities: [Role, Employee, Event, Document, Customer],
            subscribers: [],
            migrations: []
        });
        this.mainAdminConfig = mainAdminConfig;
    }

    // -----[PRIVATE PROPERTIES]-----

    private dataSource: DataSource;
    private mainAdminConfig: MainAdminConfig;


    // -----[PRIVATE METHODS]-----

    private checkMainAdminRole(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            Role.findOneBy({name: 'mainAdmin'})
                .then((mainAdminRole) => {
                    if (!mainAdminRole) {
                        return this.createMainAdminRole();
                    } else {
                        return;
                    }
                })
                .then(resolve)
                .catch(reject);
        });
    }

    private createMainAdminRole(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const mainAdminRole = Role.create({name: 'mainAdmin'});
            mainAdminRole.save()
                .then(() => resolve())
                .catch((error) => reject(new Error(`Failed to create main admin role: ${error.message}`)));
        });
    }

    private getMainAdminRoleId(): Promise<Role | null> {
        return Role.findOneBy({name: 'mainAdmin'});
    }


    private checkMainAdmin(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            Employee.findOneBy({role: {name: 'mainAdmin'}})
                .then((mainAdmin) => {
                    if (!mainAdmin) {
                        return this.createMainAdmin();
                    } else {
                        return this.updateMainAdmin(mainAdmin);
                    }
                })
                .then(resolve)
                .catch(reject);
        });
    }

    private createMainAdmin(): Promise<void> {

        return new Promise<void>((resolve, reject) => {
            this.getMainAdminRoleId()
                .then((role) => {
                    if (role) {
                        const mainAdminRoleId = role.id;

                        const newMainAdmin = Employee.create({
                            firstName: 'admin',
                            middleName: 'admin',
                            lastName: 'admin',
                            dateOfBorn: '2001-01-01',
                            post: 'admin',
                            salary: 0,
                            role: {id: mainAdminRoleId},
                            email: this.mainAdminConfig.login,
                            passwordHash: Password.calculateHash(this.mainAdminConfig.password)
                        });
                        newMainAdmin.save()
                            .then(() => resolve())
                            .catch((error) => reject(new Error(`Failed to create main admin account:
                            ${error.message}`)));
                    }
                });
        });
    }

    private updateMainAdmin(mainAdmin: Employee): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const updated = {passwordHash: this.mainAdminConfig.password};

            if (mainAdmin.email != this.mainAdminConfig.login) {
                Object.assign(updated, {login: this.mainAdminConfig.login});
            }

            Employee.update({id: mainAdmin.id}, updated)
                .then(() => resolve())
                .catch((error) => reject(new Error(`Failed to update main admin account: ${error.message}`)));
        });
    }

    // -----[PUBLIC METHODS]-----

    public connect(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.dataSource.initialize()
                .then(() => this.checkMainAdminRole())
                .then(() => this.checkMainAdmin())
                .then(resolve)
                .catch(reject);
        });
    }

    public disconnect(): Promise<void> {
        return this.dataSource.destroy();
    }
}
