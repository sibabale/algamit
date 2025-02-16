const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'users-subgraph',
  brokers: ['localhost:9092'], // Change this to your Kafka broker(s)
});

const producer = kafka.producer();

const connectProducer = async () => {
  await producer.connect();
  console.log('Kafka Producer connected (Users Subgraph)');
};

connectProducer();

module.exports = producer;
