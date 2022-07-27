import {Router, Express, Response, Request} from 'express';
import {REPL_MODE_SLOPPY} from 'repl';
import {Employee} from '../models';
import {checkHttpRequestParameters, HttpErrorHandler, Password} from '../utils';

export default class EmploteeRouter {
    constructor(expressApp: Express) {
        const router = Router()
            .post('/register', this.register.bind(this))
            .get('/:id')
            .get('/all')
            .patch('/:id', this.update.bind(this))
            .delete('/:id', this.delete.bind(this));
        expressApp.use('/api/emplyee', router);
    }

    // -----[PRIVATE METHODS]-----

    private async register(request: Request, response: Response): Promise<void> {
        try {
            const {
                body: {
                    company,
                    firstName,
                    middleName,
                    lastName,
                    dateOfBorn,
                    post,
                    salary,
                    role,
                    email,
                    passwordHash
                }
            } = request;

            if (!checkHttpRequestParameters([
                {value: company, type: 'string'},
                {value: firstName, type: 'string'},
                {value: middleName, type: 'string'},
                {value: lastName, type: 'string'},
                {value: dateOfBorn, type: 'string'},
                {value: post, type: 'string'},
                {value: role, type: 'string'},
                {value: salary, type: 'number'},
                {
                    value: email,
                    type: 'string',
                    condition: (value: string) => !!value.toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
                },
                {value: passwordHash, type: 'string', condition: (value: string) => (value.length >= 6)}
            ], response)) {
                return;
            }

            const candidate = await Employee.findOneBy({email});

            if (candidate) {
                HttpErrorHandler.userAlreadyRegistered(response);
                return;
            }

            const emplyee = await Employee.create({
                company: request.body.company,
                firstName: request.body.firstName,
                middleName: request.body.middleName,
                lastName: request.body.lastName,
                dateOfBorn: request.body.dateOfBorn,
                post: request.body.post,
                salary: request.body.salary,
                role: request.body.role,
                email: request.body.email,
                passwordHash: Password.calculateHash(passwordHash)
            });
            emplyee.save();

            response.status(201).json({message: 'Employee created succsess'});
            return;
        } catch(error) {
            HttpErrorHandler.internalServer(response, error);
        }
    }

    private async delete(request: Request, response: Response): Promise<void> {
        try {
            const {body: {email}} = request;

            if (!checkHttpRequestParameters([
                {value: email, type: 'string'}
            ], response)) {
                HttpErrorHandler.invalidParameter(response);
                return;
            }

            const candidate = await Employee.findOneBy({email});

            if (!candidate) {
                HttpErrorHandler.userNotFound(response);
                return;
            }
            await Employee.delete({email: request.body.email});
            
            Employee.save;

            response.status(200).json({message: 'Employee deleted success'});
        } catch(error) {
            HttpErrorHandler.internalServer(response, error);
        }
    }

    private async update(request: Request, response: Response): Promise<void> {
        try {
            const {body: {id, post, role, salary}} = request;

            if (!checkHttpRequestParameters([
                {value: id, type: 'number'},
                {value: post, type: 'string', optional: true},
                {value: role, type: 'string', optional: true},
                {value: salary, type: 'number', optional: true}
            ], response)) {
                HttpErrorHandler.invalidParameter(response);
                return;
            }

            const employee = await Employee.findOneBy({id: +id});

            if (!employee) {
                HttpErrorHandler.userNotFound(response);
                return;
            }

            const updated = {
                post: request.body.post ?? employee.post,
                role: request.body.role ?? employee.role,
                salary: request.body.salary ?? employee.salary
            };

            await Employee.update({id: employee.id}, updated);
            await Employee.save;            
            response.status(200).json({message: 'Employee updated sccess'});
        } catch(error) {
            HttpErrorHandler.internalServer(response, error);
        }
    }
}
