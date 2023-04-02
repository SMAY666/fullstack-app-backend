import {Express, Router, Request, Response} from 'express';
import {ILike, MoreThanOrEqual, LessThanOrEqual} from 'typeorm';
import passport from 'passport';

import {checkHttpRequestParameters, HttpErrorHandler, isValidDateEnd} from '../utils';
import {Event} from '../models';


export default class EventRouter {
    constructor(expressApp: Express) {
        const router = Router()
            .post('/create', passport.authenticate('jwt', {session: false}), this.create.bind(this))
            .get('/search', passport.authenticate('jwt', {session: false}), this.searchEvent.bind(this))
            .get('/', passport.authenticate('jwt', {session: false}), this.getAll.bind(this))
            .get('/event', passport.authenticate('jwt', {session: false}), this.getById.bind(this))
            .delete('/delete', passport.authenticate('jwt', {session: false}), this.delete.bind(this))
            .patch('/:id/update', passport.authenticate('jwt', {session: false}), this.update.bind(this));
        expressApp.use('/api/events', passport.authenticate('jwt', {session: false}), router);
    }


    // -----[PRIVATE METHODS]-----

    private async searchEvent(request: Request, response: Response): Promise<void> {
        try {
            const {query: {value, dateFrom, dateTo, status}} = request;

            if (!checkHttpRequestParameters([
                {value: value as string, type: 'string'},
                {value: dateFrom as string, type: 'string'},
                {value: dateTo as string, type: 'string'},
                {value: status as string, type: 'string'}

            ], response)) {
                return;
            }
            console.log('value:', !!value);
            const events = await Event.find(
                {
                    where: [
                        {
                            title: ILike(`%${value}%`),
                            ...(dateFrom ? {dateBegin: MoreThanOrEqual(new Date(dateFrom.toString()))} : {}),
                            ...(dateTo ? {dateEnd: LessThanOrEqual(new Date(dateTo.toString()))} : {}),
                            ...(status ? {status: status.toString()} : {})
                        },
                        {
                            description: ILike(`%${value}%`),
                            ...(dateFrom ? {dateBegin: MoreThanOrEqual(new Date(dateFrom.toString()))} : {}),
                            ...(dateTo ? {dateEnd: LessThanOrEqual(new Date(dateTo.toString()))} : {}),
                            ...(status ? {status: status.toString()} : {})
                        }
                    ]

                }
            );
            console.log(events[0]?.status);

            response.status(200).json(events);
        } catch (error) {
            HttpErrorHandler.internalServer(response, error);
        }
    }

    private async create(request: Request, response: Response): Promise<void> {
        try {
            const {body: {title, description, dateBegin, dateEnd}} = request;

            if (!checkHttpRequestParameters([
                {value: title, type: 'string'},
                {value: description, type: 'string'},
                {value: dateBegin, type: 'number'},
                {value: dateEnd, type: 'number'}
            ], response)) {
                return;
            }

            const newEvent = await Event.create({
                title,
                description,
                dateBegin: new Date(request.body.dateBegin),
                dateEnd: new Date(request.body.dateEnd),
                status: 'Open'
            });

            if (!isValidDateEnd(newEvent.dateBegin, newEvent.dateEnd)) {
                HttpErrorHandler.invalidParameter(response);
                return;
            }

            await Event.save(newEvent);

            response.status(201).json({message: 'Event created successfull'});
        } catch (error) {
            HttpErrorHandler.internalServer(response, error);
        }
    }

    private async getAll(request: Request, response: Response): Promise<void> {
        try {
            const events = await Event.find();

            if (!await Event.count()) {
                HttpErrorHandler.emptyEventList(response);
                return;
            }

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
            const {body: {id, description, status}} = request;

            if (!checkHttpRequestParameters([
                {value: id, type: 'number'},
                {value: description, type: 'string', optional: true},
                {value: status, type: 'string', optional: true}
            ], response)) {
                HttpErrorHandler.invalidParameter(response);
                return;
            }

            const event = await Event.findOneBy({id: +id});

            if (!event) {
                HttpErrorHandler.eventNotFound(response);
                return;
            }

            const updated = {
                description: request.body.description ?? event.description,
                status: request.body.status ?? event.status
            };

            await Event.update({id: +id}, updated);

            response.status(200).json({message: 'Event edit successfull'});

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

            response.status(200).json({message: 'Event deleted successfull'});
        } catch (error) {
            HttpErrorHandler.internalServer(response, error);
        }
    }
}
