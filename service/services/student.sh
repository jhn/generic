#!/bin/sh

export GENERIC_SERVICE_PORT=$PORT
export GENERIC_RESOURCE_NAME=student
export GENERIC_RESOURCE_ID_NAME=uni
export GENERIC_RESOURCE_ID_TYPE=String
export GENERIC_KAFKA_ZK=localhost:2181
export GENERIC_KAFKA_TOPIC=test

cmd="node app.js"

$cmd &
