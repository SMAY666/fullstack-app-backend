import {PassportStatic} from 'passport';
import {Strategy, ExtractJwt} from 'passport-jwt';
import {Employee} from '../models';

export default (passport: PassportStatic, secretOrKey: string): PassportStatic => {
    const options = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey
    };

    const strategy = new Strategy(options, (payload, done) => {
        Employee.findOne({
            select: ['id'],
            where: {id: +payload.userId}
        })
            .then((emplyee) => {
                if (emplyee) {
                    done(null, emplyee);
                } else {
                    done(emplyee, null);
                }
            })
            .catch((error) => {
                done(error, null);
            });
    });
    return passport.use(strategy);
};
