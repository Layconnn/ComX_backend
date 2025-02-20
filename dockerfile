# Use Node 20 Alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies using Yarn
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Generate the Prisma Client (ensure the client is generated for production)
RUN npx prisma generate

# Build the NestJS application
RUN yarn build

# Expose the application port (3000 as defined in your app)
EXPOSE 3000

# Optionally run database migrations (if you want to auto-deploy migrations)
RUN npx prisma migrate deploy

# Start the application
CMD ["node", "dist/main.js"]
