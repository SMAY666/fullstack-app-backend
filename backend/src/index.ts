import 'dotenv/config';
import App from './app'
import {cleanEnv, port} from 'envalid';


const env = cleanEnv(process.env, {
    PORT: port({
        devDefault: 5000
    })
});

const app = new App({
    port: env.PORT
})

app.run()
    .then(() => console.log(`Server is started...`))
    .catch(error => console.error('Failed to start server.', error));

