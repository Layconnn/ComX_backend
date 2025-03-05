#!/bin/sh
set -e

# Run Prisma migrations
npx prisma migrate deploy

# Start the Node application
exec node dist/main
