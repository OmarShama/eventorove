# This is a monorepo Dockerfile
# Railway should use the specific Dockerfiles in server/ and client/ directories
# This file exists to prevent Railway from using Railpack auto-detection

FROM node:18-alpine

WORKDIR /app

# Copy package.json to prevent npm errors
COPY package.json ./

# Install dependencies
RUN npm install

# This Dockerfile is not meant to be used directly
# Use server/Dockerfile or client/Dockerfile instead
CMD ["echo", "This is a monorepo. Use server/Dockerfile or client/Dockerfile for deployment."]
