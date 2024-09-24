const express = require('express');
const router = express.Router();
const prisma = require("../../db");
const passport = require('passport');

// GET all event listings for the authenticated user
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const eventOrganizerProfile = await prisma.organizerProfile.findUnique({
            where: { userId: req.user.id }
        });

        if (!eventOrganizerProfile) {
            return res.status(404).json({ message: 'Event organizer profile not found' });
        }

        const listings = await prisma.event.findMany({
            where: { userId: eventOrganizerProfile.id },
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
                serviceTags: true  // Include the serviceTags
            }
        });

        const formattedListings = listings.map(listing => ({
            ...listing,
            user: {
                id: listing.user.id,
                ...listing.user.user
            },
            serviceTags: listing.serviceTags.map(tag => tag.name)
        }));

        res.json(formattedListings);
    } catch (error) {
        console.error('Error fetching event listings:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST a new event listing
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const eventOrganizerProfile = await prisma.organizerProfile.findUnique({
            where: { userId: req.user.id }
        });

        if (!eventOrganizerProfile) {
            return res.status(404).json({ message: 'Event organizer profile not found' });
        }

        const { tagIds, ...eventData } = req.body;

        const newEventListing = await prisma.event.create({
            data: {
                ...eventData,
                dateFrom: new Date(eventData.dateFrom),
                dateTo: new Date(eventData.dateTo),
                userId: eventOrganizerProfile.id,
                serviceTags: {
                    connect: tagIds.map(id => ({ id }))
                }
            },
            include: {
                serviceTags: true
            }
        });

        res.status(201).json(newEventListing);
    } catch (error) {
        console.error('Error creating event listing:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET a specific event listing
router.get('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const eventListing = await prisma.event.findUnique({
            where: { id: parseInt(req.params.id) },
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
                serviceTags: true
            }
        });

        if (!eventListing) {
            return res.status(404).json({ message: 'Event listing not found' });
        }

        const formattedListing = {
            ...eventListing,
            user: {
                id: eventListing.user.id,
                ...eventListing.user.user
            },
            serviceTags: eventListing.serviceTags.map(tag => tag.name)
        };

        res.json(formattedListing);
    } catch (error) {
        console.error('Error fetching event listing:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT (update) an existing event listing
router.put('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const eventOrganizerProfile = await prisma.organizerProfile.findUnique({
            where: { userId: req.user.id }
        });

        if (!eventOrganizerProfile) {
            return res.status(404).json({ message: 'Event organizer profile not found' });
        }

        const existingEvent = await prisma.event.findUnique({
            where: { id: parseInt(req.params.id) }
        });

        if (!existingEvent || existingEvent.userId !== eventOrganizerProfile.id) {
            return res.status(404).json({ message: 'Event listing not found or unauthorized' });
        }

        const updatedEventListing = await prisma.event.update({
            where: { id: parseInt(req.params.id) },
            data: {
                ...req.body,
                serviceTags: {
                    set: [],
                    connect: req.body.serviceTagIds.map(id => ({ id }))
                }
            },
            include: {
                serviceTags: true
            }
        });

        res.json(updatedEventListing);
    } catch (error) {
        console.error('Error updating event listing:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;