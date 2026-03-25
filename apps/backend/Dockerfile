FROM node:22-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy prisma schema and generate client
# (schema will be volume-mounted at runtime, but we need it for the initial generate)
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source (volume-mounted in dev, but needed for the image)
COPY src ./src/

EXPOSE 3001

# At startup: regenerate client (in case schema changed), push DB schema, then start with hot reload
CMD ["sh", "-c", "npx prisma generate && npx prisma db push && node --watch src/index.js"]
