FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production --legacy-peer-deps

# Copy source code
COPY . .

# Expose port
EXPOSE 5001

# Start the application
CMD ["npm", "start"]