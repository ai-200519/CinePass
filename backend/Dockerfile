
# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .
RUN npm run build


# Runtime stage
FROM node:20-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=development

RUN apk add --no-cache curl bash && \
    curl -fsSL https://github.com/stripe/stripe-cli/releases/download/v1.19.4/stripe_1.19.4_linux_x86_64.tar.gz \
    | tar -xz -C /usr/local/bin/ && \
    chmod +x /usr/local/bin/stripe

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/assets          ./assets

EXPOSE 3000  

CMD ["node", "dist/src/main"]
