const express = require('express');
const prisma = require("../../db");

const getServiceCategories = async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Unauthorized. Only admins can access this route.' });
        }

        const categories = await prisma.serviceCategory.findMany({
            include: {
                tags: {
                    orderBy: {
                        name: 'asc'
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        res.json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const addServiceCategory = async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Unauthorized. Only admins can perform this action.' });
        }

        const { name } = req.body;
        const newCategory = await prisma.serviceCategory.create({
            data: { name }
        });

        res.status(201).json(newCategory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const addServiceTag = async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Unauthorized. Only admins can perform this action.' });
        }

        const { categoryId } = req.params;
        const { name } = req.body;
        const newTag = await prisma.serviceTag.create({
            data: {
                name,
                category: { connect: { id: categoryId } }
            }
        });

        res.status(201).json(newTag);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteServiceCategory = async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Unauthorized. Only admins can perform this action.' });
        }

        const { categoryId } = req.params;
        await prisma.serviceTag.deleteMany({
            where: { categoryId }
        });
        await prisma.serviceCategory.delete({
            where: { id: categoryId }
        });

        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteServiceTag = async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Unauthorized. Only admins can perform this action.' });
        }

        const { categoryId, tagId } = req.params;
        await prisma.serviceTag.delete({
            where: { id: tagId }
        });

        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const editServiceCategory = async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Unauthorized. Only admins can perform this action.' });
        }

        const { categoryId } = req.params;
        const { name } = req.body;
        const updatedCategory = await prisma.serviceCategory.update({
            where: { id: categoryId },
            data: { name }
        });

        res.json(updatedCategory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const editServiceTag = async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Unauthorized. Only admins can perform this action.' });
        }

        const { tagId } = req.params;
        const { name } = req.body;
        const updatedTag = await prisma.serviceTag.update({
            where: { id: tagId },
            data: { name }
        });

        res.json(updatedTag);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


module.exports = {
    getServiceCategories,
    addServiceCategory,
    addServiceTag,
    deleteServiceCategory,
    deleteServiceTag,
    editServiceCategory,
    editServiceTag
};