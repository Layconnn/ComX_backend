# Use Node.js v20 for compatibility with @nestjs/core
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies using Yarn
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the NestJS application
RUN yarn build

# Expose the port
EXPOSE 3000

# Run database migrations (optional)
RUN npx prisma migrate deploy

# Start the application
CMD ["node", "dist/main.js"]
