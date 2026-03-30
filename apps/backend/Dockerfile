FROM node:22-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source
COPY src ./src/

EXPOSE 3001

# Run migrations (safe for production) then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]
