# FROM node:18-alpine

# WORKDIR /app

# COPY package*.json ./

# RUN npm install

# COPY . .

# RUN npm run build

# EXPOSE 8000

# CMD ["npm", "start"]

# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS development
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci && \
    npm install -g ts-node tsconfig-paths nodemon && \
    npm cache clean --force
EXPOSE 8000
CMD ["npm", "run", "dev"]