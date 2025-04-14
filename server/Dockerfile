# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install --production

# Copy built application from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/src ./src

# Expose port
EXPOSE 5001

# Start the application
CMD ["npm", "start"] 