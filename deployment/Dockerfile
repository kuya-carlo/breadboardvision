FROM node:20-alpine

# Set database path to the persistent volume mount point
ENV DATABASE_PATH=/data/database.sqlite
ENV PORT=3000
ENV NODE_ENV=production

WORKDIR /app

# Copy package configurations
COPY package*.json ./

# Install only production dependencies (Alpine build tool dependencies are handled cleanly)
RUN npm ci --only=production

# Copy application files
COPY index.js ./index.js
COPY db/ ./db/
COPY routes/ ./routes/
COPY public/ ./public/

# Ensure SQLite data directory exists
RUN mkdir -p /data

EXPOSE 3000

CMD ["node", "index.js"]
