const express = require('express');
const router = express.Router();
const prisma = require("../../db");

const getInReviewListings = async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Unauthorized. Only admins can access this route.' });
        }

        const listings = await prisma.service.findMany({
            where: { status: 'in_review' },
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true
                            }
                        },

                    }
                },
                serviceTag: true  // Include the entire serviceTag object
            }
        });

        const formattedListings = listings.map(listing => {
            if (!listing.user || !listing.user.user) {
                console.error(`Service with ID ${listing.id} has no associated user`);
            }
            return {
                ...listing,
                user: listing.user?.user || null
            };
        });

        res.json(formattedListings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const reviewListing = async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Unauthorized. Only admins can perform this action.' });
        }

        const { id } = req.params;
        const { action, comment } = req.body;

        const listing = await prisma.service.findUnique({ where: { id } });

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        let updatedListing;

        if (action === 'approve') {
            updatedListing = await prisma.service.update({
                where: { id },
                data: { status: 'active' }
            });
        } else if (action === 'revise') {
            updatedListing = await prisma.service.update({
                where: { id },
                data: { status: 'revision_required', adminComment: comment }
            });
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }

        res.json(updatedListing);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getInReviewListings,
    reviewListing
};