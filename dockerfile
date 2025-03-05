FROM node:20

WORKDIR /src

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

RUN npx prisma generate

# Remove or comment out this line
# RUN npx prisma migrate deploy

RUN yarn build

EXPOSE 3000

CMD ["node", "dist/main"]
