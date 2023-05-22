// eslint linebreak-style: ["error", "windows"]


import {Router, Express, Response, Request} from 'express';
import passport from 'passport';

import {Employee} from '../models';
import {checkHttpRequestParameters, HttpErrorHandler, Password} from '../utils';
import {ILike} from 'typeorm';

export default class EmployeeRouter {
    constructor(expressApp: Express) {
        const router = Router()
            .post('/register', passport.authenticate('jwt', {session: false}), this.register.bind(this))
            .get('/', passport.authenticate('jwt', {session: false}), this.getAll.bind(this))
            .get('/employee', passport.authenticate('jwt', {session: false}), this.getById.bind(this))
            .delete('/delete', passport.authenticate('jwt', {session: false}), this.delete.bind(this))
            .patch('/:id', passport.authenticate('jwt', {session: false}), this.update.bind(this));
        expressApp.use('/api/employees', passport.authenticate('jwt', {session: false}), router);
    }

    // -----[PRIVATE METHODS]-----

    private async register(request: Request, response: Response): Promise<void> {
        try {
            const {
                body: {
                    firstName,
                    middleName,
                    lastName,
                    dateOfBorn,
                    post,
                    salary,
                    roleId,
                    email,
                    passwordHash
                }
            } = request;

            if (!checkHttpRequestParameters([
                {value: firstName, type: 'string'},
                {value: middleName, type: 'string'},
                {value: lastName, type: 'string'},
                {value: dateOfBorn, type: 'string'},
                {value: post, type: 'string'},
                {value: salary, type: 'number'},
                {value: roleId, type: 'number'},
                {
                    value: email,
                    type: 'string',
                    condition: (value) => !!(value as string).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
                },
                {
                    value: passwordHash, type: 'string',
                    condition: (value) => ((value as string).length >= 6)
                }
            ], response)) {
                return;
            }

            const candidate = await Employee.findOneBy({email});

            if (candidate) {
                HttpErrorHandler.userAlreadyRegistered(response);
                return;
            }

            const employee = await Employee.create({
                firstName: request.body.firstName,
                middleName: request.body.middleName,
                lastName: request.body.lastName,
                dateOfBorn: request.body.dateOfBorn,
                post: request.body.post,
                salary: request.body.salary,
                role: {id: request.body.roleId},
                email: request.body.email,
                passwordHash: Password.calculateHash(passwordHash)
            });
            employee.save();

            response.status(201).json({message: 'Employee created succsessful'});
            return;
        } catch(error) {
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
            const candidate = await Employee.findOneBy({id: +id});

            if (!candidate) {
                HttpErrorHandler.userNotFound(response);
                return;
            }

            await Employee.delete({id: +id});

            await Employee.save;

            response.status(200).json({message: 'Employee deleted successful'});
        } catch(error) {
            HttpErrorHandler.internalServer(response, error);
        }
    }

    private async update(request: Request, response: Response): Promise<void> {
        try {
            const {body: {id, post, roleId, salary, description}} = request;

            if (!checkHttpRequestParameters([
                {value: id, type: 'number'},
                {value: post, type: 'string', optional: true},
                {value: roleId, type: 'number', optional: true},
                {value: salary, type: 'number', optional: true},
                {value: description, type: 'string', optional: true}
            ], response)) {
                return;
            }

            const employee = await Employee.findOneBy({id: +id});

            if (!employee) {
                HttpErrorHandler.userNotFound(response);
                return;
            }

            const updated = {
                post: request.body.post ?? employee.post,
                role: {id: request.body.roleId ?? employee.role.id},
                salary: request.body.salary ?? employee.salary,
                description: request.body.description ?? employee.description
            };

            await Employee.update({id: employee.id}, updated);
            await Employee.save;
            response.status(200).json({message: 'Employee updated sccess'});
        } catch(error) {
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

            const employee = await Employee.findOne(
                {
                    where: {id: +id},
                    relations: {role: true}
                }
            );

            if (!employee) {
                HttpErrorHandler.userNotFound(response);
                return;
            }

            response.status(200).json(employee);
            return;
        } catch(error) {
            HttpErrorHandler.internalServer(response, error);
        }
    }

    private async getAll(request: Request, response: Response): Promise<void> {
        try {
            const {query: {name}} = request;

            if (!checkHttpRequestParameters([
                {value: name as string, type: 'string', optional: true}
            ], response)) {
                return;
            }
            const employees = await Employee.find(
                {
                    where: {
                        ...(name ? {firstName: ILike(`%${name}%`)} : {}),
                        ...(name ? {middleName: ILike(`%${name}%`)} : {}),
                        ...(name ? {lastName: ILike(`%${name}%`)} : {})
                    },
                    relations: {role: true},
                    order: {id: 'DESC'}
                }
            );

            if (!await Employee.count()) {
                HttpErrorHandler.userNotFound(response);
                return;
            }
            response.status(200).json(employees);
            return;
        } catch(error) {
            HttpErrorHandler.internalServer(response, error);
        }
    }
}
