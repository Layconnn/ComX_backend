# Use an official Node.js runtime as a parent image
FROM node:16-alpine

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies using Yarn
COPY package.json yarn.lock ./
RUN yarn install --production

# Copy the rest of the application code
COPY . .

# Generate Prisma client (important for production)
RUN npx prisma generate

# Build the NestJS application
RUN yarn build

# Expose the port
EXPOSE 3000

# Set environment variables for Prisma
ENV DATABASE_URL=${DATABASE_URL}

# Run database migrations (optional, but helpful for smooth deploys)
RUN npx prisma migrate deploy

# Start the application
CMD ["node", "dist/main.js"]
