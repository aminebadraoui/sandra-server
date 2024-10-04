const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

const NUM_SERVICE_PROVIDERS = 50;
const NUM_LISTINGS_PER_PROVIDER = 5;

async function generateMockData() {
    for (let i = 0; i < NUM_SERVICE_PROVIDERS; i++) {
        const user = await createUser();
        const serviceProvider = await createServiceProviderProfile(user.id);
        for (let j = 0; j < NUM_LISTINGS_PER_PROVIDER; j++) {
            await createServiceListing(serviceProvider.id);
        }
    }
}

async function createUser() {
    return await prisma.user.create({
        data: {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            hashedPassword: faker.internet.password(),
            role: 'service_provider',
            emailVerified: faker.date.past(),
        }
    });
}

async function createServiceProviderProfile(userId) {
    return await prisma.serviceProviderProfile.create({
        data: {
            userId: userId,
            bio: faker.lorem.paragraph(),
            skills: [faker.word.sample(), faker.word.sample(), faker.word.sample()],
            experience: faker.lorem.sentence(),
        }
    });
}

async function createServiceListing(serviceProviderId) {
    const category = await getRandomCategory();
    const tag = await getRandomTag(category.id);

    return await prisma.service.create({
        data: {
            userId: serviceProviderId,
            title: faker.commerce.productName(),
            description: faker.lorem.paragraph(),
            location: faker.location.city(),
            category: category.name,
            tagId: tag.id,
            currency: 'USD',
            pricing: {
                hourly: faker.number.int({ min: 10, max: 200 }),
                daily: faker.number.int({ min: 50, max: 1000 }),
                fixed: faker.number.int({ min: 100, max: 5000 })
            },
            mainImage: faker.image.url(),
            additionalImages: [faker.image.url(), faker.image.url()],
            status: faker.helpers.arrayElement(['in_review', 'active', 'needs_revision']),
        }
    });
}

async function getRandomCategory() {
    const categories = await prisma.serviceCategory.findMany();
    return categories[Math.floor(Math.random() * categories.length)];
}

async function getRandomTag(categoryId) {
    const tags = await prisma.serviceTag.findMany({
        where: { categoryId: categoryId }
    });
    return tags[Math.floor(Math.random() * tags.length)];
}

generateMockData()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
