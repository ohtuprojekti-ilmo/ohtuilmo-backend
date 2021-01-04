# Set base image
FROM node:12-alpine

# Set working directory for the app in container
WORKDIR /app

# Expose container's port 8081 to the outside
EXPOSE 8081

# Copy package.json to container's /app directory and install dependencies
COPY package* ./
RUN npm ci
COPY . .

# Launch application
CMD node index.js