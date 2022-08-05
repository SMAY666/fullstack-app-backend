import {Express, Request, Response, Router} from 'express';
import passport from 'passport';


import {checkHttpRequestParameters, HttpErrorHandler} from '../utils';
import {Role} from '../models';


export default class RoleRouter {
    constructor(expressApp: Express) {
        const router = Router()
            .post('/create', passport.authenticate('jwt', {session: false}), this.create.bind(this))
            .get('/', passport.authenticate('jwt', {session: false}))
            .get('/:id', passport.authenticate('jwt', {session: false}))
            .delete('/:id', passport.authenticate('jwt', {session: false}));
        expressApp.use('/api/role', passport.authenticate('jwt', {session: false}), router);
    }


    // -----[PRIVATE METHODS]-----

    private async create(request: Request, response: Response): Promise<void> {
        try {
            const {body: {name}} = request;

            if (!checkHttpRequestParameters([
                {
                    value: name, 
                    type: 'string',
                    condition: (value: string) => value != 'mainAdmin'
                }
            ], response)) {
                return;
            }

            const possibleRole = await Role.findOneBy({name: request.body.name});

            if (possibleRole) {
                HttpErrorHandler.roleIsNotUnique(response);
            }

            const newRole = await Role.create({name: request.body.name});
            newRole.save();
            
            response.status(201).json({message: 'Role created successfull'});
        } catch(error) {
            HttpErrorHandler.internalServer(response, error);
        }
    }

}
