import {PassportStatic} from 'passport';
import {Strategy, ExtractJwt} from 'passport-jwt';
import {User} from '../models';

export default (passport: PassportStatic, secretOrKey: string): PassportStatic => {
    const options = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey
    };

    const strategy = new Strategy(options, (payload, done) => {
        User.findOne({
            select: ['id'],
            where: {id: +payload.userId}
        })
            .then((user) => {
                if (user) {
                    done(null, user);
                } else {
                    done(user, null);
                }
            })
            .catch((error) => {
                done(error, null);
            });
    });
    return passport.use(strategy);
};
