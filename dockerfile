# Use an official Node.js runtime (adjust version as needed)
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies using Yarn
COPY package.json yarn.lock ./
RUN yarn install --production

# Copy the rest of your application code
COPY . .

# Build the NestJS application (assuming you have a build script in package.json)
RUN yarn build

# Expose the port your app listens on (e.g., 3000)
EXPOSE 3000

# Start the application
CMD ["node", "dist/main.js"]
