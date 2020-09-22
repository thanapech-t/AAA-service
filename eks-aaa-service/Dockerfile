FROM node:12

WORKDIR /app

COPY app/ .
COPY package.json .
COPY node_modules ./node_modules/
COPY config/config.sandbox.json ./config.json
COPY .env ./.env
COPY src/swaggers/ ./swaggers/

CMD [ "node", "index.js" ]
