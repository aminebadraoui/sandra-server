const express = require('express');
const cors = require('cors');

// Auth
const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const jwt = require('jsonwebtoken')

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(passport.initialize())

const jwtAuth = passport.authenticate('jwt', { session: false });

// JWT configuration
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'
};
a

passport.use(new JwtStrategy(jwtOptions, (jwt_payload, done) => {
    if (jwt_payload.id == 1) {
        return done(null, { id: 1, username: 'admin' })
    }

    return done(null, false)
}));

app.post('/login', (req, res) => {
    const userExists = true
    if (userExists) {
        const token = jwt.sign({ id: 1 }, jwtOptions.secretOrKey)

        res.json({ message: 'Login successful', token: token })
    } else {
        res.status(401).json({ message: 'Authentication failed' });
    }
})

// Extract protected route function
function protectedRoute(req, res) {
    res.json({ message: 'This is a protected route', user: req.user });
}

app.get('/protected', jwtAuth, protectedRoute)




// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Sandra App api 2 ' });
});

// Add more routes here
// app.use('/api/users', require('./routes/users'));
// app.use('/api/posts', require('./routes/posts'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});