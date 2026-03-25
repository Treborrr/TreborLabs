FROM node:22-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy config files (these are NOT volume-mounted)
COPY vite.config.js tailwind.config.js postcss.config.js ./

# Copy source and public (volume-mounted in dev, but needed for the image)
COPY index.html ./
COPY public ./public/
COPY src ./src/

EXPOSE 5173

# server.host: true is set in vite.config.js so Vite binds to 0.0.0.0
CMD ["npm", "run", "dev"]
