# Use Node 20 Alpine image
FROM node:20-alpine

# Increase Node's memory allocation (if needed)
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Set working directory to match Render's default directory
WORKDIR /opt/render/project/src

# Copy package files and install dependencies using Yarn
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

RUN yarn install --production=false

COPY . .

RUN npx prisma generate
RUN npx prisma migrate deploy
RUN yarn build

# Expose the application port (3000 as defined in your app)
EXPOSE 4000

# Optionally run database migrations (if you want to auto-deploy migrations)
RUN npx prisma migrate deploy

# Start the application in development mode
CMD ["node", "dist/main.js"]
