# Monitoring of the organization's activities
Run `npm install` or `npm i` for install backend dependencies

Before starting, you need to create a PostgreSQL database "MOA_system": `create database MOA_system`;
Don't forget to set the environment variables before starting the server!
To start the server, use the `npm run` start command

# Backend
## Environment variables

File .env at the root of the project.'
###### Template
~~~
NODE_ENV=<string>
PORT=<number> // devDefault: 5000, default: 80
MORGAN_FORMAT=<string> // devDefault: 'dev', default: 'common'
_SECRET_OR_KEY=<string>
_EXPIRATION_TIME=<string> // default: '12h'
_USERNAME=<string> // default: 'postgres'
_PASSWORD=<string>
_HOST=<string> // devDefault: 'localhost'
_PORT=<number> // default: 5432
_NAME=<string> // default: 'register_of_citizens'
_ADMIN_LOGIN=<string> // devDefault: 'admin'
_ADMIN_PASSWORD=<string> // devDefault: 'admin'
~~~

## Scripts

###### Build
Run `npm run build` to build the project. The build artifacts will be stored in the dist/ directory.

###### Production server
Run `npm run start` for a production server. Navigate to http://localhost:{env.PORT}.

###### Development build
Run `npm run build:dev` to build the project. The build artifacts will be stored in the dist/ directory.

###### Development server
Run `npm run start:dev` for a dev server. Navigate to http://localhost:{env.PORT}.

###### Development build with watching
Run `npm run build:watch` to build the project. The build artifacts will be stored in the dist/ directory. The application will automatically reload if you change any of the source files.

###### Development server with watching
Run `npm run start:watch` for a dev server. Navigate to http://localhost:{env.PORT}. The application will automatically reload if you change any of the source files.
