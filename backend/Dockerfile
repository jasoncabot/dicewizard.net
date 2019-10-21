FROM node:10-alpine

WORKDIR /usr/src/app

COPY package.json ./
COPY index.js ./

RUN npm install --silent

EXPOSE 4500

CMD npm start