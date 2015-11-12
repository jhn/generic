#!/bin/sh

export GENERIC_SERVICE_PORT=$PORT
export GENERIC_RESOURCE_NAME=student
export GENERIC_RESOURCE_ID_NAME=uni
export GENERIC_RESOURCE_ID_TYPE=String
export GENERIC_KAFKA_ZK=localhost:2181
export GENERIC_KAFKA_TOPIC=test

cmd="node app.js"

$cmd &

sleep 3

address="http://localhost:$PORT/config/field"
echo $address
curl -X POST -H "Content-type: application/json" --data "{\"name\": \"first\",\"required\": true,\"type\": \"String\",\"subfields\": []}" $address
curl -X POST -H "Content-type: application/json" --data "{\"name\": \"last\",\"required\": true,\"type\": \"String\",\"subfields\": []}" $address
curl -X POST -H "Content-type: application/json" --data "{\"name\": \"courses\",\"required\": true,\"type\": \"Array\",\"subfields\": []}" $address
