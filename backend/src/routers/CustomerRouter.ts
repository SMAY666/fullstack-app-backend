// eslint linebreak-style: ["error", "windows"]


import {Router, Express, Response, Request} from 'express';
import passport from 'passport';
import {Customer, Employee} from '../models';
import {checkHttpRequestParameters, HttpErrorHandler} from '../utils';


export default class CustomerRouter {
    constructor(expressApp: Express) {
        const router = Router()
            .post('/create', passport.authenticate('jwt', {session: false}), this.create.bind(this))
            .get('/', passport.authenticate('jwt', {session: false}), this.getAll.bind(this))
            .get('/customer', passport.authenticate('jwt', {session: false}), this.getById.bind(this))
            .delete('/delete', passport.authenticate('jwt', {session: false}), this.delete.bind(this))
            .patch('/:id/update', passport.authenticate('jwt', {session: false}), this.update.bind(this));
        expressApp.use('/api/customers', passport.authenticate('jwt', {session: false}), router);
    }


    // -----[PRIVATE METHODS]-----

    private async create(request: Request, response: Response): Promise<void> {
        try {
            const {body: {fullName, phoneNumber, email, type, description, assignedEmployeeId}} = request;


            if (!checkHttpRequestParameters(
                [
                    {value: fullName, type: 'string'},
                    {value: phoneNumber, type: 'string'},
                    {
                        value: email,
                        type: 'string',
                        condition: (value) => !!(value as string).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
                    },
                    {value: type, type: 'string'},
                    {value: description, type: 'string'},
                    {value: assignedEmployeeId, type: 'number'}

                ], response)) {
                return;
            }

            const candidate = await Customer.findOneBy({email: email});

            if (candidate) {
                HttpErrorHandler.userAlreadyRegistered(response);
            }

            const employee = await Employee.findOneBy({id: assignedEmployeeId});

            if (!employee) {
                HttpErrorHandler.userNotFound(response);
            }

            const newCustomer = await Customer.create({
                fullName: fullName,
                phoneNumber: phoneNumber,
                email: email,
                type: type,
                description: description,
                assignedEmployee: {id: assignedEmployeeId},
                documentsCount: 0
            });

            await newCustomer.save();

            response.status(201).json({message: 'Customer created successfully'});

        } catch (error) {
            HttpErrorHandler.internalServer(response, error);
        }
    }


    private async getAll(request: Request, response: Response): Promise<void> {
        try {
            const customers = await Customer.find();

            if (!await Customer.count()) {
                HttpErrorHandler.userNotFound(response);
                return;
            }

            response.status(200).json(customers);
            return;

        } catch (error) {
            HttpErrorHandler.internalServer(response, error);
        }
    }

    private async getById(request: Request, response: Response): Promise<void> {
        try {
            const {query: {id}} = request;

            if (!checkHttpRequestParameters([
                {value: id as string, type: 'string'}
            ], response)) {
                return;
            }
            if (!id) {
                HttpErrorHandler.missingParameters(response);
                return;
            }

            const customer = await Customer.findOne(
                {
                    relations: {assignedEmployee: true},
                    where: {id: +id}
                }
            );

            if (!customer) {
                HttpErrorHandler.userNotFound(response);
                return;
            }

            response.status(200).json(customer);

        } catch (error) {
            HttpErrorHandler.internalServer(response, error);
        }
    }


    private async update(request: Request, response: Response): Promise<void> {
        try {
            const {body: {id, fullName, phoneNumber, email, type, description, assignedEmployeeId}} = request;

            if (!checkHttpRequestParameters([
                {value: id, type: 'string'},
                {value: fullName, type: 'string', optional: true},
                {value: phoneNumber, type: 'string', optional: true},
                {value: email, type: 'string', optional: true},
                {value: type, type: 'string', optional: true},
                {value: description, type: 'string', optional: true},
                {value: assignedEmployeeId, type: 'string', optional: true}
            ], response)) {
                return;
            }

            const customer = await Customer.findOneBy({id: +id});

            if (!customer) {
                HttpErrorHandler.userNotFound(response);
                return;
            }

            const updated = {
                fullName: request.body.fullName ?? customer.fullName,
                phoneNumber: request.body.phoneNumber ?? customer.phoneNumber,
                email: request.body.email ?? customer.email,
                type: request.body.type ?? customer.type,
                description: request.body.description ?? customer.description,
                assignedEmployee: {id: request.body.assignedEmployeeId ?? customer.assignedEmployee.id}
            };

            await Customer.update({id: customer.id}, updated);
            await Customer.save;

            response.status(200).json({message: 'Customer updated successfully'});

        } catch (error) {
            HttpErrorHandler.internalServer(response, error);
        }
    }

    private async delete(request: Request, response: Response): Promise<void> {
        try {
            const {query: {id}} = request;

            if (!checkHttpRequestParameters([
                {value: id as string, type: 'string'}
            ], response)) {
                return;
            }

            if (!id) {
                HttpErrorHandler.missingParameters(response);
                return;
            }

            const customer = await Customer.findOneBy({id: +id});

            if (!customer) {
                HttpErrorHandler.userNotFound(response);
                return;
            }

            await Customer.delete({id: +id});
            await Customer.save;

            response.status(200).json({message: 'Customer deleted successfully'});
        } catch (error) {
            HttpErrorHandler.internalServer(response, error);
        }
    }
}
