# Stage 1: Build the React Client
FROM node:18-alpine AS client-build
WORKDIR /app/client

# Copy client package files and install dependencies
COPY client/package*.json ./
RUN npm install

# Copy client source code and build
COPY client/ .
RUN npm run build

# Stage 2: Setup the Node Server
FROM node:18-alpine
WORKDIR /app/server

# Copy server package files and install dependencies
COPY server/package*.json ./
RUN npm install --production

# Copy server source code
COPY server/ .

# Copy built client assets from Stage 1 to server's public directory
COPY --from=client-build /app/client/dist ./public

# Expose the server port
EXPOSE 3001

# Start the server
CMD ["node", "index.js"]
