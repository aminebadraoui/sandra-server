const express = require('express');
const router = express.Router();
const prisma = require("../../db");
const passport = require('passport');

router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const serviceProviders = await prisma.serviceProviderProfile.findMany({
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                services: {
                    include: {
                        serviceTag: {
                            include: {
                                category: true
                            }
                        }
                    }
                }
            }
        });

        const formattedProviders = serviceProviders.map(serviceProvider => ({
            id: serviceProvider.id,
            name: `${serviceProvider.user.firstName} ${serviceProvider.user.lastName}`,
            email: serviceProvider.user.email,
            description: serviceProvider.bio,
            mainImage: serviceProvider.services[0]?.mainImage || null,
            services: serviceProvider.services.map(service => ({
                id: service.id,
                title: service.title,
                description: service.description,
                category: service.serviceTag.category.name,
                tag: service.serviceTag.name,
                pricing: service.pricing,
                mainImage: service.mainImage,
                additionalImages: service.additionalImages,
                status: service.status,
                location: service.location
            }))
        }));

        res.json(formattedProviders);
    } catch (error) {
        console.error('Error fetching service providers:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { id } = req.params;
        const serviceProvider = await prisma.serviceProviderProfile.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                services: {
                    include: {
                        serviceTag: {
                            include: {
                                category: true
                            }
                        }
                    }
                }
            }
        });

        if (!serviceProvider) {
            return res.status(404).json({ message: 'Service provider not found' });
        }

        // Format the data as needed
        const formattedProvider = {
            id: serviceProvider.id,
            name: `${serviceProvider.user.firstName} ${serviceProvider.user.lastName}`,
            email: serviceProvider.user.email,
            description: serviceProvider.bio,
            mainImage: serviceProvider.services[0]?.mainImage || null,
            services: serviceProvider.services.map(service => ({
                id: service.id,
                title: service.title,
                description: service.description,
                category: service.serviceTag.category.name,
                tag: service.serviceTag.name,
                pricing: service.pricing,
                mainImage: service.mainImage,
                additionalImages: service.additionalImages,
                status: service.status,
                location: service.location
            }))
        };

        res.json(formattedProvider);
    } catch (error) {
        console.error('Error fetching service provider:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;