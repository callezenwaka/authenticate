# postgresql-database/Dockerfile
FROM node:18-slim

WORKDIR /app

# Install PostgreSQL client tools
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port (if your service needs to expose any ports)
# EXPOSE 5432

# Set environment variables
ENV NODE_ENV=production

# Set default command
CMD ["npm", "run", "migration:run"]