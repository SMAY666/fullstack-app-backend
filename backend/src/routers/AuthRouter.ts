import {Express, Router, Response, Request} from 'express';
import jwt from 'jsonwebtoken';

import {User} from '../models';
import {checkHttpRequestParameters, Password, HttpErrorHandler} from '../utils';

type AuthRouterOptions = {
    secretOrKey: string
    expirationTime: string
}

export default class AuthRouter {
    constructor(expressApp: Express, options: AuthRouterOptions) {
        this.options = options;

        const router = Router()
            .post('/register', this.register.bind(this))
            .post('/login', this.login.bind(this));

        expressApp.use('/api/auth', router);
    }

    // -----[PRIVATE PROPERTIES]-----

    private options: AuthRouterOptions;

    // -----[PRIVATE METHODS]-----

    private async register(request: Request, response: Response): Promise<void> {
        try {
            const {body: {firstName, middleName, lastName, dateOfBorn, role, email, password}} = request;

            if (!checkHttpRequestParameters([
                {value: firstName, type: 'string'},
                {value: middleName, type: 'string'},
                {value: lastName, type: 'string'},
                {value: dateOfBorn, type: 'string'},
                {value: role, type: 'string'},
                {
                    value: email,
                    type: 'string',
                    condition: (value: string) => !!value.toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
                },
                {value: password, type: 'string', condition: (value: string) => (value.length >= 6)}
            ], response)) {
                return;
            }
            const user = await User.findOneBy({email});
            if (user) {
                HttpErrorHandler.userAlreadyRegistered(response);
                return;
            }

            const newUser = User.create({
                firstName: request.body.firstName,
                middleName: request.body.middleName,
                lastName: request.body.lastName,
                dateOfBorn: request.body.dateOfBorn,
                role: request.body.role,
                email: request.body.email,
                password: Password.calculateHash(request.body.password)
            });
            await newUser.save();
            response.status(201).json({message: 'User registred success'});

        } catch (error) {
            HttpErrorHandler.internalServer(response, error);
        }
    }

    private async login(request: Request, response: Response): Promise<void> {
        try {
            const {body: {email, password}} = request;

            if (!checkHttpRequestParameters([
                {value: email, type: 'string'},
                {value: password, type: 'string'}
            ], response)) {
                return;
            }

            const candidate = await User.findOneBy({email});


            if (!candidate || !Password.check(request.body.password, candidate.password)) {
                HttpErrorHandler.invalidParameter(response);
                return;
            }

            const token = jwt.sign(
                {userId: candidate.id},
                this.options.secretOrKey,
                {expiresIn: this.options.expirationTime}
            );

            response.status(200).json(token);

        } catch (error) {
            HttpErrorHandler.internalServer(response, error);
        }
    }
}
