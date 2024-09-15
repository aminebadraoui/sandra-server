# Build stage
FROM node:14-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production

# Production stage
FROM node:14-alpine
WORKDIR /app
COPY --from=build /app .
COPY src ./src 
EXPOSE 5000
CMD ["node", "src/server.js"]