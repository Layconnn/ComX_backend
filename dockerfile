# Use an official Node.js runtime as a parent image
FROM node:16-alpine

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies using Yarn
COPY package.json yarn.lock ./

# Use --frozen-lockfile to ensure package versions are respected
RUN yarn install --frozen-lockfile --ignore-scripts

# Copy the rest of the application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the NestJS application
RUN yarn build

# Expose the port
EXPOSE 3000

# Run database migrations (optional but helpful for deployment)
RUN npx prisma migrate deploy

# Start the application
CMD ["node", "dist/main.js"]
