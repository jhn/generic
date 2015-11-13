#!/bin/sh

export GENERIC_SERVICE_PORT=$PORT
export GENERIC_RESOURCE_NAME=course
export GENERIC_RESOURCE_ID_NAME=cid
export GENERIC_RESOURCE_ID_TYPE=String
export GENERIC_KAFKA_ZK=localhost:2181
export GENERIC_KAFKA_TOPIC=test

cmd="node app.js"

$cmd &

sleep 3

address="http://localhost:$PORT/course/config/field"
curl -X POST -H "Content-type: application/json" --data "{\"name\": \"professor\",\"required\": true,\"type\": \"String\",\"subfields\": []}" $address
curl -X POST -H "Content-type: application/json" --data "{\"name\": \"course_name\",\"required\": true,\"type\": \"String\",\"subfields\": []}" $address
curl -X POST -H "Content-type: application/json" --data "{\"name\": \"students\",\"required\": true,\"type\": \"Array\",\"subfields\": []}" $address
