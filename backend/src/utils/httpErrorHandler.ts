import {Response} from 'express';

export default abstract class HttpErrorHandler {

    // -----[PUBLIC STATIC METHODS]-----

    public static missingParameters(response: Response): void {
        response.status(400).json({message: 'One or more required parameters are missing'});
    }

    public static invalidParameter(response: Response): void {
        response.status(400).json({message: 'The parameter has an invalid value'});
    }

    public static invalidAuthorizationData(response: Response): void {
        response.status(401).json({message: 'Incorrect email or password was entered'});
    }

    public static userAlreadyRegistered(response: Response): void {
        response.status(401).json({message: 'The user with this email is already registered'});
    }

    public static internalServer(response: Response, error: Error | unknown): void {
        response.status(500).json({
            message: `An internal server error has occurred: ${(error instanceof Error)
                ? error.message : error}`
        });
    }

}
