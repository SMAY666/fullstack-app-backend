// eslint linebreak-style: ["error", "windows"]
/* eslint-disable camelcase */

import 'dotenv/config';
import App from './app';

import {cleanEnv, port, str, host, num} from 'envalid';


const env = cleanEnv(process.env, {
    PORT: port({devDefault: 5000}),
    MORGAN_FORMAT: str({
        devDefault: 'dev',
        default: 'common',
        docs: 'https://www.npmjs.com/package/morgan'
    }),
    JWT_SECRET_OR_KEY: str(),
    JWT_EXPIRATION_TIME: num({default: 3600000}),
    DB_USERNAME: str({default: 'postgres'}),
    DB_PASSWORD: str(),
    DB_HOST: host({default: 'localhost'}),
    DB_PORT: port({default: 5432}),
    DB_NAME: str({default: 'MOA_System'}),
    MAIN_ADMIN_LOGIN: str({default: 'admin'}),
    MAIN_ADMIN_PASSWORD: str({default: 'admin'})
});

const app = new App(
    {
        port: env.PORT,
        morganFormat: env.MORGAN_FORMAT,
        jwt: {
            secretOrKey: env.JWT_SECRET_OR_KEY,
            expirationTime: env.JWT_EXPIRATION_TIME
        }
    },
    {
        username: env.DB_USERNAME,
        password: env.DB_PASSWORD,
        host: env.DB_HOST,
        port: env.DB_PORT,
        name: env.DB_NAME
    },
    {
        login: env.MAIN_ADMIN_LOGIN,
        password: env.MAIN_ADMIN_PASSWORD
    }
);

app.run()
    .then(() => console.log('Server is started...'))
    .catch((error) => console.error('Failed to start server.', error));


