require("dotenv").config();
const amqp = require("amqplib");
const config = require("../vars/rabbitmq-configs");
const { FLUSH_TO_SINGLE_ID } = require("../vars/rabbitmq-events");
const { flushToSingleID } = require("../ssehandler");
const POD_NAME = process.env.POD_NAME || "podless";

//step 1 : Connect to the rabbitmq server
//step 2 : Create a new channel
//step 3 : Create the exchange
//step 4 : Create the queue
//step 5 : Bind the queue to the exchange
//step 6 : Consume messages from the queue

function brokerActions(data) {
  try {
    const parameters = data.message.parameters;

    switch (data.event) {
      case FLUSH_TO_SINGLE_ID:
        // trigger flushToSingleID
        flushToSingleID(parameters.type, parameters.userID, parameters.result);
        break;
      default:
        break;
    }
  } catch (ex) {
    console.log("Action Invalid: ", data, data.message.parameters, ex);
  }
}

async function consumeMessages() {
  try {
    const connection = await amqp.connect(config.rabbitMQ.url);
    const channel = await connection.createChannel();

    await channel.assertExchange(config.rabbitMQ.exchangeName, "fanout");

    const q = await channel.assertQueue("");

    await channel.bindQueue(q.queue, config.rabbitMQ.exchangeName, "");
    //   await channel.bindQueue(q.queue, config.rabbitMQ.exchangeName, "INFO");
    //   await channel.bindQueue(q.queue, config.rabbitMQ.exchangeName, "WARNING");
    //   await channel.bindQueue(q.queue, config.rabbitMQ.exchangeName, "ERROR");

    channel.consume(q.queue, (msg) => {
      const data = JSON.parse(msg.content);
      channel.ack(msg);

      //action trigger: { logType: "INFO", message: any, pod: podname, event: event_string, dateTime: date_value }
      if (data.pod !== POD_NAME && data.logType === "INFO:NEONREMOTE") {
        // console.log(data);
        brokerActions(data);
      }
    });
  } catch (ex) {
    console.log("Unable to connect message broker");
  }
}

module.exports = consumeMessages;

