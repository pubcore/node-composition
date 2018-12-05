FROM node:10.14.1-alpine

ARG HOME=/home/node
ARG APP_WORKDIR=$HOME/app

RUN apk update && apk add openssh-client git

USER node

RUN mkdir -p $HOME/.npm $APP_WORKDIR

WORKDIR $APP_WORKDIR

ENTRYPOINT ["npm"]
