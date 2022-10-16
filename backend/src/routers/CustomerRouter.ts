import {Router, Express, Response, Request} from 'express';
import passport from 'passport';
import {Customer} from '../models';
import {checkHttpRequestParameters, HttpErrorHandler} from '../utils';


export default class CustomerRouter {
    constructor(expressApp: Express) {
        const router = Router()
            .post('/create', passport.authenticate('jwt', {session: false}), this.create.bind(this))
            .get('/', passport.authenticate('jwt', {session: false}), this.getAll.bind(this))
            .get('/:id', passport.authenticate('jwt', {session: false}), this.getById.bind(this));
        // .patch()
        // .delete();
        expressApp.use('/api/customers', passport.authenticate('jwt', {session: false}), router);
    }


    // -----[PRIVATE METHODS]-----


    private async create(request: Request, response: Response) {
        try {
            const {body: {fullName, phoneNumber, email, description}} = request;


            if (!checkHttpRequestParameters(
                [
                    {value: fullName, type: 'string'},
                    {value: phoneNumber, type: 'string'},
                    {
                        value: email,
                        type: 'string',
                        condition: (value) => !!(value as string).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
                    },
                    {value: description, type: 'string'}
                ], response)) {
                return;
            }

            const candidate = await Customer.findOneBy({email: email});

            if (candidate) {
                HttpErrorHandler.userAlreadyRegistered(response);
            }

            const newCustomer = await Customer.create({
                fullName: fullName,
                phoneNumber: phoneNumber,
                email: email,
                description: description,
                documentsCount: 0
            });

            newCustomer.save();

            response.status(201).json({message: 'Customer created successfully'});

        } catch(error) {
            HttpErrorHandler.internalServer(response, error);
        }
    }

    private async getAll(request: Request, response: Response) {
        try {
            const customers = await Customer.find();

            if (!Customer.count()) {
                HttpErrorHandler.userNotFound(response);
                return;
            }

            response.status(200).json(customers);
            return;

        } catch(error) {
            HttpErrorHandler.internalServer(response, error);
        }
    }

    private async getById(request: Request, response: Response) {
        try {
            const {body: {id}} = request;

            if (!checkHttpRequestParameters([
                {value: id, type: 'number'}
            ], response)) {
                return;
            }

            const customer = await Customer.findOneBy({id: +id});


            if (!customer) {
                HttpErrorHandler.userNotFound(response);
                return;
            }

            response.status(200).json(customer);

        } catch(error) {
            HttpErrorHandler.internalServer(response, error);
        }
    }
}
