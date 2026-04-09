FROM node:20-slim AS base
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY patches/ ./patches/

# Install dependencies
RUN pnpm install --frozen-lockfile || pnpm install

# Copy source
COPY . .

# Build client + server
RUN pnpm run build

# Production
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/index.js"]
