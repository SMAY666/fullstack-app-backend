import express from 'express';
import cors from 'cors';
import morgan from 'morgan'

import {DataBase, DataBaseConfig, MainAdminConfig} from "./data-base";
import setPassportJwtStrategy from "./middlewares/setPassportJwtStrategy";
import passport from "passport";
import {AuthRouter, EmploteeRouter, EventRouter, RoleRouter} from "./routers";
import {Server} from "http";


type AppConfig = {
    port: number;
    morganFormat: string;
    jwt: {
        secretOrKey: string;
        expirationTime: string;
    }
}


export default class App {
    constructor(config: AppConfig, dataBaseConfig: DataBaseConfig, mainAdminConfig: MainAdminConfig) {
        this.port = config.port;
        setPassportJwtStrategy(passport, config.jwt.secretOrKey);


        this.expressApp = express()
            .use(express.json())
            .use(express.urlencoded({extended: true}))
            .use(cors())
            .use(morgan(config.morganFormat))
            .use(passport.initialize())

        this.addRoters(config)

        this.dataBase = new DataBase(dataBaseConfig, mainAdminConfig);
    }

    //-----[PRIVATE PROPERTIES]-----

    private readonly port: number;
    private readonly expressApp: express.Express;

    private dataBase: DataBase;
    private server: Server | undefined



    //-----[PRIVATE METHODS]-----

    private addRoters(config: AppConfig): void {
        (new AuthRouter(this.expressApp, config.jwt));
        (new EmploteeRouter(this.expressApp));
        (new RoleRouter(this.expressApp));
        (new EventRouter(this.expressApp));
    }

    //-----[PUBLIC METHODS]-----

    public run(): Promise<void> {
        if (this.server) {
            return Promise.reject(new Error("Server is already running."))
        }
        return new Promise((resolve, reject) => {
            this.server = this.expressApp.listen(this.port);
            this.dataBase.connect()
                .then(() => {
                    resolve()
                })
                .catch(error => reject(new Error(`Failed to connect to database: ${error.message}`)));
        });
    }

    public stop(): Promise<void> {
        if (!this.server) {
            return Promise.reject(new Error('Server is not running.'));
        }
        return new Promise((resolve, reject) => {
            this.server?.close();
            this.dataBase.disconnect()
                .then(resolve)
                .catch(reject)
        })

    }
}
