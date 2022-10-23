// eslint linebreak-style: ["error", "windows"]


import {Router, Express, Response, Request} from 'express';
import passport from 'passport';
import {checkHttpRequestParameters, HttpErrorHandler} from '../utils';
import {Customer, Document} from '../models';


export default class DocumentRouter {
    constructor(expressApp: Express) {
        const router = Router()
            .post('/create', passport.authenticate('jwt', {session: false}), this.create.bind(this))
            .get('/', passport.authenticate('jwt', {session: false}), this.getAll.bind(this))
            .get('/:id', passport.authenticate('jwt', {session: false}), this.getById.bind(this))
            .patch('/:id/update', passport.authenticate('jwt', {session: false}), this.update.bind(this))
            .delete('/:id', passport.authenticate('jwt', {session: false}), this.delete.bind(this));
        expressApp.use('/api/documents', passport.authenticate('jwt', {session: false}), router);
    }

    // -----[PRIVATE METHODS]-----

    private async create(request: Request, response: Response): Promise<void> {
        try {
            const {body: {type, description, customerId, dateOfBegin, dateOfEnd}} = request;

            if (!checkHttpRequestParameters([
                {value: type, type: 'string'},
                {value: description, type: 'string'},
                {value: customerId, type: 'number'},
                {value: dateOfBegin, type: 'string'},
                {value: dateOfEnd, type: 'string'}
            ], response)) {
                return;
            }

            const customer = await Customer.findOneBy({id: +customerId});

            if (!customer) {
                HttpErrorHandler.userNotFound(response);
                return;
            }

            const document = await Document.create({
                type: request.body.type,
                title: request.body.type + ' ' + customer.fullName + ' от ' + request.body.dateOfBegin,
                description: request.body.description,
                customer: {id: request.body.customerId},
                dateOfBegin: request.body.dateOfBegin,
                dateOfEnd: request.body.dateOfEnd

            });

            await document.save();
            customer.documentsCount += 1;

            response.status(201).json({message: 'Document created successfully'});

        } catch(error) {
            HttpErrorHandler.internalServer(response, error);
        }
    }


    private async getAll(request: Request, response: Response): Promise<void> {
        try {
            const documents = await Document.find();

            if (!await Document.count()) {
                HttpErrorHandler.documentNotFound(response);
                return;
            }

            response.status(200).json(documents);
        } catch (error) {
            HttpErrorHandler.internalServer(response, error);
        }
    }


    private async getById(request: Request, response: Response): Promise<void> {
        try {
            const {body: {id}} = request;

            if (!checkHttpRequestParameters([
                {value: id, type: 'number'}
            ], response)) {
                return;
            }
            const document = await Document.findOneBy({id: +id});

            if (!document) {
                HttpErrorHandler.documentNotFound(response);
                return;
            }

            response.status(200).json(document);
        } catch (error) {
            HttpErrorHandler.internalServer(response, error);
        }
    }


    private async update(request: Request, response: Response): Promise<void> {
        try {
            const {body: {id, type, description, customerId, dateOfBegin, dateOfEnd}} = request;

            if (!checkHttpRequestParameters([
                {value: id, type: 'number'},
                {value: type, type: 'string', optional: true},
                {value: description, type: 'string', optional: true},
                {value: customerId, type: 'number', optional: true},
                {value: dateOfBegin, type: 'string', optional: true},
                {value: dateOfEnd, type: 'string', optional: true}
            ], response)) {
                return;
            }
            const customer = await Customer.findOneBy({id: +customerId});

            if (!customer) {
                HttpErrorHandler.userNotFound(response);
                return;
            }

            const document = await Document.findOneBy({id: +id});

            if (!document) {
                HttpErrorHandler.documentNotFound(response);
                return;
            }

            const updated = {
                type: request.body.type ?? document.type,
                title: request.body.type + customer.fullName + ' от ' + request.body.dateOfBegin ?? document.title,
                description: request.body.description,
                customer: {id: request.body.customerId ?? document.customer.id},
                dateOfBegin: request.body.dateOfBegin ?? document.dateOfBegin,
                dateOfEnd: request.body.dateOfEnd ?? document.dateOfEnd
            };

            await Document.update({id: +id}, updated);
            await Document.save;

            response.status(200).json({message: 'Document updated successfully'});
        } catch (error) {
            HttpErrorHandler.internalServer(response, error);
        }
    }

    private async delete(request: Request, response: Response): Promise<void> {
        try {
            const {body: {id}} = request;

            if (!checkHttpRequestParameters([
                {value: id, type: 'number'}
            ], response)) {
                return;
            }

            const document = await Document.findOneBy({id: +id});

            if (!document) {
                HttpErrorHandler.documentNotFound(response);
                return;
            }

            await Document.delete({id: +id});
            await Document.save;

            response.status(200).json({message: 'Document deleted successfully'});

        } catch (error) {
            HttpErrorHandler.internalServer(response, error);
        }
    }
}
