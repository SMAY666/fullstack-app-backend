import express from 'express';


type AppConfig = {
    port: number
}


export default class App {
    constructor(config: AppConfig) {
        this.config = config;
        this.expressApp = express();
    }

    private config: AppConfig;
    private expressApp: express.Express;


    public run(): Promise<void> {
        return new Promise((resolve) => {
            this.expressApp.listen(this.config.port, resolve);
        });
    }
}
