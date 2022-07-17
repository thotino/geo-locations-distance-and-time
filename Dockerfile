FROM node:14-buster-slim

# ENV APP_GOOGLE_MAPS_API_KEY='AIzaSyBrRh0NjtrSopoOrG-4_W3OP0nmzSDQK-M'
# ENV APP_SERVER_PORT=3000
# ENV APP_REDIS_PORT=6379

RUN mkdir -p /usr/app
WORKDIR /usr/app

COPY . /usr/app

RUN yarn install --production && yarn autoclean --init && yarn autoclean --force


RUN chmod +x docker-entrypoint.sh

ENTRYPOINT [ "./docker-entrypoint.sh" ]

EXPOSE 3000