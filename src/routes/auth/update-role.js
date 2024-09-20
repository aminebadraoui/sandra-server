const express = require('express');
const prisma = require("../../db");

const updateRole = async (req, res) => {
    try {
        const { role } = req.body;
        const userId = req.user.id;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { role: role },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true
            }
        });

        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { updateRole };
