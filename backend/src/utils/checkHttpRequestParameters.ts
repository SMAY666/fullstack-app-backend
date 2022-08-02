import {Response} from 'express';

import {HttpErrorHandler} from './index';

type Parameter = {
    value: any;
    type: string;
    condition?: (value: any) => boolean;
    optional?: boolean;
};


export default (parameters: Parameter[], response: Response): boolean => {
    for (const parameter of parameters) {
        if ((typeof parameter.value == 'undefined') && parameter.optional) {
            continue;
        }

        if ((typeof parameter.value == 'undefined') && !parameter.optional) {
            HttpErrorHandler.missingParameters(response);
            return false;
        }
        if ((typeof parameter.value != parameter.type) || 
            (parameter.condition && !parameter.condition(parameter.value))) {
            HttpErrorHandler.invalidParameter(response);
            return false;
        }
    }
    return true;
};
