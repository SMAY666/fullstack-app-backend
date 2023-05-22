import {Express, Router, Request, Response} from 'express';
import {ILike, MoreThanOrEqual, LessThanOrEqual, IsNull} from 'typeorm';
import passport from 'passport';

import {checkHttpRequestParameters, HttpErrorHandler, isValidDateEnd} from '../utils';
import {Event} from '../models';
import {isNumber} from 'util';


export default class EventRouter {
    constructor(expressApp: Express) {
        const router = Router()
            .post('/create', passport.authenticate('jwt', {session: false}), this.create.bind(this))
            .get('/', passport.authenticate('jwt', {session: false}), this.getAll.bind(this))
            .get('/event', passport.authenticate('jwt', {session: false}), this.getById.bind(this))
            .delete('/delete', passport.authenticate('jwt', {session: false}), this.delete.bind(this))
            .patch('/:id/update', passport.authenticate('jwt', {session: false}), this.update.bind(this));
        expressApp.use('/api/events', passport.authenticate('jwt', {session: false}), router);
    }


    // -----[PRIVATE METHODS]-----

    private async create(request: Request, response: Response): Promise<void> {
        try {
            const {body: {title, description, dateBegin, dateEnd, issuedFor}} = request;

            if (!checkHttpRequestParameters([
                {value: title, type: 'string'},
                {value: description, type: 'string'},
                {value: dateBegin, type: 'number'},
                {value: dateEnd, type: 'number'},
                {value: issuedFor, type: 'number', optional: true}
            ], response)) {
                return;
            }

            const newEvent = await Event.create({
                title,
                description,
                dateBegin: new Date(request.body.dateBegin),
                dateEnd: new Date(request.body.dateEnd),
                status: 'Open',
                issuedFor: issuedFor ?? null
            });

            if (!isValidDateEnd(newEvent.dateBegin, newEvent.dateEnd)) {
                HttpErrorHandler.invalidParameter(response);
                return;
            }

            await Event.save(newEvent);

            response.status(201).json({message: 'Event created successful'});
        } catch (error) {
            HttpErrorHandler.internalServer(response, error);
        }
    }

    private async getAll(request: Request, response: Response): Promise<void> {
        try {
            const {query: {value, dateFrom, dateTo, status, issuedFor}} = request;

            if (!checkHttpRequestParameters([
                {value: value as string, type: 'string', optional: true},
                {value: dateFrom as string, type: 'string', optional: true},
                {value: dateTo as string, type: 'string', optional: true},
                {value: status as string, type: 'string', optional: true},
                {value: issuedFor as string, type: 'string', optional: true}
            ], response)) {
                return;
            }

            const events = await Event.find({
                order: {dateBegin: 'ASC'},
                relations: {issuedFor: true},
                where: [
                    // TODO: Сделать дату в локальном часовом поясе
                    {
                        title: ILike(`%${value}%`),
                        ...(dateFrom ? {dateBegin: MoreThanOrEqual(new Date(dateFrom.toString()))} : {}),
                        ...(dateTo ? {dateEnd: LessThanOrEqual(new Date(dateTo.toString()))} : {}),
                        ...(status ? {status: status.toString()} : {}),
                        ...(issuedFor ? {issuedFor: {id: +issuedFor}} : {issuedFor: IsNull()})
                    },
                    {
                        description: ILike(`%${value}%`),
                        ...(dateFrom ? {dateBegin: MoreThanOrEqual(new Date(dateFrom.toString()))} : {}),
                        ...(dateTo ? {dateEnd: LessThanOrEqual(new Date(dateTo.toString()))} : {}),
                        ...(status ? {status: status.toString()} : {}),
                        ...(issuedFor ? {issuedFor: {id: +issuedFor}} : {issuedFor: IsNull()})
                    }]

            });
            response.status(200).json(events);
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
                HttpErrorHandler.invalidParameter(response);
                return;
            }
            if (!id) {
                HttpErrorHandler.missingParameters(response);
                return;
            }

            const event = await Event.findOneBy({id: +id});

            if (!event) {
                HttpErrorHandler.eventNotFound(response);
                return;
            }

            response.status(200).json(event);
        } catch (error) {
            HttpErrorHandler.internalServer(response, error);
        }
    }

    private async update(request: Request, response: Response): Promise<void> {
        try {
            const {body: {id, title, description, dateBegin, dateEnd, status}} = request;

            if (!checkHttpRequestParameters([
                {value: id, type: 'number'},
                {value: title, type: 'string', optional: true},
                {value: description, type: 'string', optional: true},
                {value: dateBegin, type: 'string', optional: true},
                {value: dateEnd, type: 'string', optional: true},
                {value: status, type: 'string', optional: true}
            ], response)) {
                return;
            }

            const event = await Event.findOneBy({id: +id});

            if (!event) {
                HttpErrorHandler.eventNotFound(response);
                return;
            }

            const updated = {
                title: request.body.title ?? event.title,
                description: request.body.description ?? event.description,
                dateBegin: request.body.dateBegin ?? event.dateBegin,
                dateEnd: request.body.dateEnd ?? event.dateEnd,
                status: request.body.status
            };

            await Event.update({id: +id}, updated);

            response.status(200).json({message: 'Event edit successful'});

        } catch (error) {
            HttpErrorHandler.internalServer(response, error);
        }
    }

    private async delete(request: Request, response: Response): Promise<void> {
        try {
            const {query: {id}} = request;

            if (!id) {
                HttpErrorHandler.missingParameters(response);
                return;
            }

            const event = await Event.findOneBy({id: +id});

            if (!event) {
                HttpErrorHandler.eventNotFound(response);
                return;
            }

            await Event.delete({id: +id});

            response.status(200).json({message: 'Event deleted successful'});
        } catch (error) {
            HttpErrorHandler.internalServer(response, error);
        }
    }
}
