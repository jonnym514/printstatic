FROM node:20-slim
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Build client + server
RUN npm run build

# Production
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/index.js"]
