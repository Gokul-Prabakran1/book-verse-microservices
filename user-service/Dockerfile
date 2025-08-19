# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first (for Docker layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install



# Copy application code
COPY . .


# Expose the port your app runs on
EXPOSE 3000


# Start the application
CMD ["npm", "start"]
