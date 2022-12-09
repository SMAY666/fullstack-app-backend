import {Express, Router, Request, Response} from 'express';
import passport from 'passport';

import {checkHttpRequestParameters, HttpErrorHandler} from '../utils';
import {Event} from '../models';


export default class EventRouter {
    constructor(expressApp: Express) {
        const router = Router()
            .post('/create', passport.authenticate('jwt', {session: false}), this.create.bind(this))
            .get('/search=:searchValue', passport.authenticate('jwt', {session: false}), this.searchEvent.bind(this))
            .get('/', passport.authenticate('jwt', {session: false}), this.getAll.bind(this))
            .get('/:id', passport.authenticate('jwt', {session: false}), this.getById.bind(this))
            .patch('/:id', passport.authenticate('jwt', {session: false}), this.update.bind(this))
            .delete('/:id', passport.authenticate('jwt', {session: false}), this.delete.bind(this));
        expressApp.use('/api/events', passport.authenticate('jwt', {session: false}), router);
    }


    // -----[PRIVATE METHODS]-----

    private async searchEvent(request: Request, response: Response): Promise<void> {
        try {
            const {body: {searchValue}} = request;

            if (!checkHttpRequestParameters([
                {value: searchValue, type: 'string'}
            ], response)) {
                return;
            }

            const events = await Event.query(
                `SELECT * FROM events WHERE
                       LOWER(title) LIKE LOWER('%${searchValue}%')
                       OR LOWER(description) LIKE LOWER('%${searchValue}%')
                       OR LOWER(status) LIKE LOWER('%${searchValue}%')`
            );

            if (events.length === 0) {
                HttpErrorHandler.eventNotFound(response);
                return;
            }

            response.status(200).json(events);
        } catch (error) {
            HttpErrorHandler.internalServer(response, error);
        }
    }

    private checkDateValue(dateOfTheBegining: string, dateOfTheEnd: string): boolean {
        const dateNow = new Date();

        const today = dateNow.getDate() < 10 ? '0' + dateNow.getDate() + '.' + (dateNow.getMonth() - -1) + '.' + dateNow.getFullYear() : dateNow.getDate() + '.' + (dateNow.getMonth() - -1) + '.' + dateNow.getFullYear();
        if (
            new Date(dateOfTheBegining) > new Date(dateOfTheEnd) ||
            new Date(dateOfTheBegining) < new Date(today) ||
            new Date(dateOfTheEnd) < new Date(today)
        ) {
            return false;
        }
        else {
            return true;
        }
    }

    private async create(request: Request, response: Response): Promise<void> {
        try {
            const {body: {title, description, dateOfTheBegining, dateOfTheEnd}} = request;

            if (!checkHttpRequestParameters([
                {value: title, type: 'string'},
                {value: description, type: 'string'},
                {value: dateOfTheBegining, type: 'string'},
                {value: dateOfTheEnd, type: 'string'}
            ], response)) {
                return;
            }

            const newEvent = await Event.create({
                title: request.body.title,
                description: request.body.description,
                dateOfTheBegining: request.body.dateOfTheBegining,
                dateOfTheEnd: request.body.dateOfTheEnd,
                status: 'Open'
            });

            if (!this.checkDateValue(newEvent.dateOfTheBegining, newEvent.dateOfTheEnd)) {
                HttpErrorHandler.invalidParameter(response);
                return;
            }


            await Event.save(newEvent);

            response.status(201).json({message: 'Event created successfull'});
        } catch(error) {
            console.log(error);
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
        } catch(error) {
            HttpErrorHandler.internalServer(response, error);
        }
    }

    private async getById(request: Request, response: Response): Promise<void> {
        try {
            const {body: {id}} = request;

            if (!checkHttpRequestParameters([
                {value: id, type: 'number'}
            ], response)) {
                HttpErrorHandler.invalidParameter(response);
                return;
            }

            const event = await Event.findOneBy({id: +id});

            if (!event) {
                HttpErrorHandler.eventNotFound(response);
                return;
            }

            response.status(200).json(event);
        } catch(error) {
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
            await Event.save;

            response.status(200).json({message: 'Event edit successfull'});

        } catch (error) {
            HttpErrorHandler.internalServer(response, error);
        }
    }

    private async delete(request: Request, response: Response): Promise<void> {
        try {
            const {body: {id}} = request;

            const event = await Event.findOneBy({id: +id});

            if (!event) {
                HttpErrorHandler.eventNotFound(response);
                return;
            }

            await Event.delete({id: +id});
            await Event.save;

            response.status(200).json({message: 'Event deleted successfull'});
        } catch(error) {
            HttpErrorHandler.internalServer(response, error);
        }
    }
}
