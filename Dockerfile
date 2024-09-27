FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV MONGODB_CLUSTER_PASS=demonterror187
ENV JWT_SECRET=neonaiserver12345678
ENV MAILINGSERVICE=https://automatedemailservice.onrender.com
#RabbitMQ
ENV RABBITMQ_USER=neonsystems
ENV RABBITMQ_PASS=neonsystems
ENV RABBITMQ_URL=rabbitmq-0.rabbitmq.rabbits.svc.cluster.local
ENV RABBITMQ_PORT=5672

ENV PORT=3007

EXPOSE 3007

CMD [ "npm", "start" ]