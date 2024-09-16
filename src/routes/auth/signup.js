const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const { jwtOptions } = require('../../config/passport');

const prisma = require("../../db")


const signup = async (req, res) => {
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
};

module.exports = { signup }