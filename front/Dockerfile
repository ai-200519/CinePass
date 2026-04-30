# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source and build
COPY . .
RUN npm run build


# Runtime stage
FROM nginx:1.27-alpine

# SPA routing + sensible caching rules
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Vite build output
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
