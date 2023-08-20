FROM node:20.5.1-alpine3.18

WORKDIR /home/node/app

COPY ./package.json .
COPY ./package-lock.json .

RUN npm install

COPY . .

RUN npm run build

CMD npm run start:prod