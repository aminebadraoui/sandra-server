const express = require('express');
const cors = require('cors');
require('dotenv').config()

const adminRoutes = require('./routes/admin');
const categoriesRoutes = require('./routes/categories');
const serviceListingsRoutes = require('./routes/serviceListings');

// Auth
const passportConfig = require('./config/passport');

// Routes
const authRoutes = require('./routes/auth');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passportConfig.initialize())


app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/categories', categoriesRoutes);
app.use('/service-listings', serviceListingsRoutes);


// Extract protected route function
function protectedRoute(req, res) {
    res.json({ message: 'This is a protected route', user: req.user });
}

app.get('/protected', passportConfig.jwtAuth, protectedRoute)


// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Sandra App api 2 ' });
});


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});