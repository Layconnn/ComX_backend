# Use Node 20 Alpine image
FROM node:20-alpine

# Increase Node's memory allocation (adjust as needed)
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Set working directory
WORKDIR /app

# Copy package files and install dependencies using Yarn
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Generate the Prisma Client
RUN npx prisma generate

# Build the NestJS application
RUN yarn build

# Expose the application port (3000 as defined in your app)
EXPOSE 3000

# Optionally run database migrations
RUN npx prisma migrate deploy

# Start the application in development mode (watch mode)
CMD ["yarn", "start:dev"]
