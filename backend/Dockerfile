# Use Node.js 20 (LTS) as the base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
# We need devDependencies for the build step (tsc)
RUN npm install

# Copy source code
COPY . .

# Build the TypeScript code
RUN npm run build

# Copy proto files to dist
COPY src/proto ./dist/proto

# Create keys directory
RUN mkdir keys

# Prune devDependencies to keep the image small
# (Optional, but good practice. However, if you need ts-node or other dev tools in prod, skip this)
# RUN npm prune --production

# Expose the port the app runs on (defaulting to 3000 or whatever your app uses)
# Based on common Express apps, usually 3000 or 8080. 
# I'll expose 3000 and 8080 just in case, or check env vars.
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
