const express = require('express');
const router = express.Router();
const prisma = require("../../db");
const passport = require('passport');

// Submit a new service listing
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const serviceProviderProfile = await prisma.serviceProviderProfile.findUnique({
            where: { userId: req.user.id }
        });

        if (!serviceProviderProfile) {
            return res.status(400).json({ message: 'Service provider profile not found' });
        }

        const {
            title,
            description,
            location,
            category,
            tag,
            currency,
            pricing,
            mainImage,
            additionalImages
        } = req.body;

        const newListing = await prisma.service.create({
            data: {
                title,
                description,
                location,
                category,
                currency,
                pricing,
                mainImage,
                additionalImages,
                status: 'in_review',
                user: {
                    connect: { id: serviceProviderProfile.id }
                },
                serviceTag: {
                    connect: { id: tag }  // Assuming 'tag' is now the ID of the ServiceTag
                }
            }
        });

        res.status(201).json(newListing);
    } catch (error) {
        console.error('Error submitting service listing:', error);
        res.status(500).json({ message: 'Error submitting service listing' });
    }
});

// Get all service listings for the authenticated user
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // First, find the ServiceProviderProfile for the authenticated user
        const serviceProviderProfile = await prisma.serviceProviderProfile.findUnique({
            where: { userId: req.user.id }
        });

        if (!serviceProviderProfile) {
            return res.status(404).json({ message: 'Service provider profile not found' });
        }

        // Now, use the ServiceProviderProfile ID to fetch the listings
        const listings = await prisma.service.findMany({
            where: { userId: serviceProviderProfile.id },
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true
                            }
                        }
                    }
                },
                serviceTag: true  // Include the entire serviceTag object
            }
        });

        // Format the listings to include user information and tag name directly
        const formattedListings = listings.map(listing => ({
            ...listing,
            user: {
                id: listing.user.id,
                ...listing.user.user
            },
            tag: listing.serviceTag ? listing.serviceTag.name : 'Unknown Tag'
        }));

        res.json(formattedListings);
    } catch (error) {
        console.error('Error fetching service listings:', error);
        res.status(500).json({ message: 'Error fetching service listings' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const serviceListing = await prisma.service.findUnique({
            where: { id },
            include: {
                serviceTag: {
                    include: {
                        category: true
                    }
                },
                user: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });

        if (!serviceListing) {
            return res.status(404).json({ message: 'Service listing not found' });
        }

        res.json(serviceListing);
    } catch (error) {
        console.error('Error fetching service listing:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updatedListing = await prisma.service.update({
            where: { id },
            data: {
                title: updateData.title,
                description: updateData.description,
                location: updateData.location,
                mainImage: updateData.mainImage,
                additionalImages: updateData.additionalImages,
                pricing: updateData.pricing,
                status: updateData.status,
                currency: updateData.currency,
                serviceTag: {
                    connect: { id: updateData.serviceTag }
                },
                revisionComments: updateData.revisionComments
            },
            include: {
                serviceTag: {
                    include: {
                        category: true
                    }
                }
            }
        });

        res.json(updatedListing);
    } catch (error) {
        console.error('Error updating service listing:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;