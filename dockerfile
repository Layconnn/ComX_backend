# Use Node 20 Alpine image
FROM node:20-alpine

# Increase Node's memory allocation (if needed)
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Set working directory to match Render's default directory
WORKDIR /opt/render/project/src

# Copy package files and install dependencies using Yarn
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Generate the Prisma Client (ensure the client is generated for development)
RUN npx prisma generate

# Build the NestJS application (if needed in dev mode, this might not be required)
RUN yarn build

# Expose the application port (3000 as defined in your app)
EXPOSE 3000

# Optionally run database migrations (if you want to auto-deploy migrations)
RUN npx prisma migrate deploy

# Start the application in development mode
CMD ["yarn", "start:dev"]
