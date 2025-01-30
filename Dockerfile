# Base Dockerfile
FROM node:20 AS lambda-base

# Set the working directory
WORKDIR /workdir

# Copy the PNPM workspace files
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./

# Install rsync
RUN apt-get update && apt-get install -y rsync && rm -rf /var/lib/apt/lists/*

# Install PNPM
RUN npm install -g pnpm

# Copy the rest of the workspace
COPY lib/ ./lib/

RUN pnpm install -p --frozen-lockfile
RUN pnpm build-libs

# Use this image as a base for others
