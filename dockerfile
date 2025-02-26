FROM node:20

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

RUN npx prisma generate

RUN npx prisma migrate deploy

RUN yarn build

EXPOSE 3000

CMD ["node", "dist/main"]
