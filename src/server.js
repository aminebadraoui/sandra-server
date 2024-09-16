const express = require('express');
const cors = require('cors');

require('dotenv').config();

// Auth
const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');

const app = express();
const port = process.env.PORT || 5000;

// Database
const { PrismaClient } = require('@prisma/client');
const databaseUrl = process.env.DATABASE_URL;
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: databaseUrl,
        },
    },
});

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


app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({
            where: { email: email }
        });

        if (user && await bcrypt.compare(password, user.hashedPassword)) {
            const token = jwt.sign({ id: user.id }, jwtOptions.secretOrKey);
            res.json({ message: 'Login successful', token: token });
        } else {
            res.status(401).json({ message: 'Authentication failed' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/signup', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email }
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await prisma.user.create({
            data: {
                email: email,
                hashedPassword: hashedPassword,
                firstName: firstName,
                lastName: lastName
            },
        });

        // Generate JWT token
        const token = jwt.sign({ id: newUser.id }, jwtOptions.secretOrKey);

        res.status(201).json({ message: 'User created successfully', token: token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

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