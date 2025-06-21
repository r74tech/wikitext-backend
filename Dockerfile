# build stage
FROM oven/bun:latest AS build

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --production

# Copy source files
COPY . .

# runtime stage
FROM oven/bun:distroless AS runtime

WORKDIR /app

# Copy everything from build stage
COPY --from=build --chown=nonroot:nonroot /app/node_modules ./node_modules
COPY --from=build --chown=nonroot:nonroot /app/package.json ./package.json
COPY --from=build --chown=nonroot:nonroot /app/src ./src
COPY --from=build --chown=nonroot:nonroot /app/db ./db
COPY --from=build --chown=nonroot:nonroot /app/tsconfig.json ./tsconfig.json

USER nonroot
EXPOSE 8300

CMD ["run", "--hot", "src/index.ts"]