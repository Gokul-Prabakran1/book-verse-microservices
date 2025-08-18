# ----------- Stage 1: Dependencies -----------
FROM node:20-alpine AS deps

WORKDIR /app

# Copy only package files
COPY package*.json ./

# Install all dependencies 
RUN npm ci && npm cache clean --force

# ----------- Stage 2: Application Layer -----------
FROM node:20-alpine

WORKDIR /app

# Copy only the needed files/folders
COPY --from=deps /app/node_modules ./node_modules

COPY . .



EXPOSE 3004

# Start your app
CMD ["npm", "start"]
