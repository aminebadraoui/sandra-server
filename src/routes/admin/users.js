const express = require('express');
const prisma = require("../../db");

const getUsers = async (req, res) => {
    try {
        // Check if the current user is an admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Unauthorized. Only admins can access this route.' });
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isAdmin: true
            }
        });

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getUsers };