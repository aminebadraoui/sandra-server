const express = require('express');
const prisma = require("../../db");

const makeAdmin = async (req, res) => {
    try {
        const { userId } = req.body;

        // Check if the current user is an admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Unauthorized. Only admins can perform this action.' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { isAdmin: true },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isAdmin: true
            }
        });

        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { makeAdmin };