var kafka = require('kafka-node'),
    HighLevelProducer = kafka.HighLevelProducer,
    client = new kafka.Client(process.env.GENERIC_KAFKA_ZK, process.env.GENERIC_RESOURCE_NAME),
    producer = new HighLevelProducer(client),
    kafkaTopic = process.env.GENERIC_KAFKA_TOPIC;

producer.on('ready', function() {
  console.log('kafka-producer is ready');
});

module.exports = {
  send: function(evt) {
    producer.send([{ topic: kafkaTopic, messages: JSON.stringify(evt) }], function(err, data) {
      if (err) console.log(err);
    });
  }
}
