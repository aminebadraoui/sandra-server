const express = require('express')
const router = express.Router()

const prisma = require("../../db")

const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');

const signout = async (req, res) => {
    res.json({ message: 'Logged out successfully' });
}


module.exports = { signout }