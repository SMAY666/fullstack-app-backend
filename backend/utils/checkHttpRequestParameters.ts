import {Response} from "express";

import {HttpErrorHandler} from './'

type Parameter = {
    value: any,
    type: string,
    condition?: (value: any) => boolean,
    optional?: boolean
};

export default (parameters: Parameter[], response: Response): boolean => {
    for (let parameter of parameters) {
        if (typeof parameter.value == 'undefined') {
            HttpErrorHandler.missingParameters(response);
            return false;
        }
        if (typeof parameter.value !== parameter.type || parameter.condition && !parameter.condition(parameter.value)) {
            HttpErrorHandler.invalidParameter(response)
            return false;
        }
    }
    return true
}
