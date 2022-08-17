#syntax=docker/dockerfile:experimental

FROM node:16
WORKDIR /app

RUN chown -R node.node /app

COPY .bash_docker /app
RUN cat .bash_docker >> /root/.bashrc
RUN cat .bash_docker >> /home/node/.bashrc

RUN mkdir ~/.ssh/ && ssh-keyscan -t rsa github.com >> ~/.ssh/known_hosts

RUN --mount=type=ssh,uid=1000 yarn global add uranio

