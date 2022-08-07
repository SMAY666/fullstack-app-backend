import {Express, Router, Request, Response} from 'express';
import passport from 'passport';

import {checkHttpRequestParameters, HttpErrorHandler} from '../utils';
import {Event} from '../models';


export default class EventRouter {
    constructor(expressApp: Express) {
        const router = Router()
            .post('/create', passport.authenticate('jwt', {session: false}), this.create.bind(this))
            .get('/', passport.authenticate('jwt', {session: false}))
            .get('/:id', passport.authenticate('jwt', {session: false}))
            .patch('/:id', passport.authenticate('jwt', {session: false}))
            .delete('/:id', passport.authenticate('jwt', {session: false}));

        expressApp.use('/api/events', passport.authenticate('jwt', {session: false}), router);
    }


    // -----[PRIVATE METHODS]-----

    private async create(request: Request, response: Response): Promise<void> {
        try {
            const {body: {title, description, dateOfTheBegining, dateOfTheEnd}} = request;

            if (!checkHttpRequestParameters([
                {value: title, type: 'string'},
                {value: description, type: 'string'},
                {value: dateOfTheBegining, type: 'string', optional: true},
                {value: dateOfTheEnd, type: 'string'}
            ], response)) {
                HttpErrorHandler.invalidParameter(response);
                return;
            }

            if (new Date(request.body.dateOfTheBegining) < new Date() ||
                 new Date(request.body.dateOfTheEnd) < new Date() ||
                 new Date(request.body.dateOfTheEnd) < new Date(request.body.dateOfTheBegining)) {
                HttpErrorHandler.incorrectaDateValue(response);
                return;
            }

            const newEvent = await Event.create({
                title: request.body.title,
                description: request.body.description,
                dateOfTheBegining: request.body.dateOfTheBegining ?? new Date(),
                dateOfTheEnd: request.body.dateOfTheEnd,
                status: 'Open'
            });
            await Event.save(newEvent);

            response.status(201).json({message: 'Event created successfull'});
        } catch(error) {
            HttpErrorHandler.internalServer(response, error);
        }
    }
}
