FROM node:20-slim

# Set database path to the persistent volume mount point
ENV DATABASE_PATH=/data/database.sqlite
ENV PORT=3000
ENV NODE_ENV=production

WORKDIR /app

# Copy package configurations and host-built node_modules
COPY package*.json ./
COPY node_modules/ ./node_modules/

# Copy application files
COPY index.js ./index.js
COPY db/ ./db/
COPY routes/ ./routes/
COPY public/ ./public/

# Ensure SQLite data directory exists
RUN mkdir -p /data

EXPOSE 3000

CMD ["node", "index.js"]
