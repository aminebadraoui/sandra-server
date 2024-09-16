const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const prisma = require('../db'); // Assuming you've set up a centralized Prisma client

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret' // Use environment variable for security
};

passport.use(new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: jwt_payload.id }
        });
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (error) {
        return done(error, false);
    }
}));

module.exports = {
    initialize: () => passport.initialize(),
    jwtAuth: passport.authenticate('jwt', { session: false }),
    jwtOptions
};