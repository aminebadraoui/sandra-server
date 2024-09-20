const express = require('express')
const router = express.Router()

const prisma = require("../../db")

const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const { jwtOptions } = require('../../config/passport');

const signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({
            where: { email: email }
        });

        if (user && await bcrypt.compare(password, user.hashedPassword)) {
            const token = jwt.sign({ id: user.id }, jwtOptions.secretOrKey);

            const { hashedPassword, ...userWithoutPassword } = user
            res.json({ message: 'Login successful', token: token, user: userWithoutPassword });
        } else {
            res.status(401).json({ message: 'Authentication failed' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}



module.exports = { signin }