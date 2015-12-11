kafka_2.10-0.8.2.2/bin/zookeeper-server-start.sh kafka_2.10-0.8.2.2/config/zookeeper.properties &&
sleep 5
kafka_2.10-0.8.2.2/bin/kafka-server-start.sh kafka_2.10-0.8.2.2/config/server.properties &&
sleep 5
kafka_2.10-0.8.2.2/bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic generic &&
sleep 5
kafka_2.10-0.8.2.2/bin/kafka-console-consumer.sh --zookeeper localhost:2181 --topic generic --from-beginning
