import {Express, Router, Response, Request} from 'express';
import jwt from 'jsonwebtoken';

import {Employee} from '../models';
import {checkHttpRequestParameters, Password, HttpErrorHandler} from '../utils';

type AuthRouterOptions = {
    secretOrKey: string
    expirationTime: string
}

export default class AuthRouter {
    constructor(expressApp: Express, options: AuthRouterOptions) {
        this.options = options;

        const router = Router()
            .post('/login', this.login.bind(this));

        expressApp.use('/api/auth', router);
    }

    // -----[PRIVATE PROPERTIES]-----

    private options: AuthRouterOptions;

    // -----[PRIVATE METHODS]-----

    private async login(request: Request, response: Response): Promise<void> {
        try {
            const {body: {email, passwordHash}} = request;

            if (!checkHttpRequestParameters([
                {value: email, type: 'string'},
                {value: passwordHash, type: 'string'}
            ], response)) {
                return;
            }

            const candidate = await Employee.findOneBy({email});

            if (!candidate || !Password.check(request.body.passwordHash, candidate.passwordHash)) {
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
