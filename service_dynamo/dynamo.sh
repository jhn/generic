#!/bin/sh

. ./keys.sh

export GENERIC_SERVICE_PORT=$PORT
export GENERIC_RESOURCE_NAME="student"
export GENERIC_RESOURCE_ID_NAME="sid"
export GENERIC_RESOURCE_ID_TYPE=String
export GENERIC_KAFKA_ZK=localhost:2181
export GENERIC_KAFKA_TOPIC="generic"

cmd="node app.js"

$cmd &

sleep 23

address="http://localhost:$PORT/student/config/field"
curl -X POST -H "Content-type: application/json" --data "{\"name\": \"first_name\",\"required\": true,\"type\": \"String\",\"subfields\": []}" $address
echo "\n"
curl -X POST -H "Content-type: application/json" --data "{\"name\": \"last_name\",\"required\": true,\"type\": \"String\",\"subfields\": []}" $address
echo "\n"
curl -X POST -H "Content-type: application/json" --data "{\"name\": \"school_name\",\"required\": true,\"type\": \"String\",\"subfields\": []}" $address
echo "\n"
curl -X POST -H "Content-type: application/json" --data "{\"name\": \"school_level\",\"required\": true,\"type\": \"String\",\"subfields\": []}" $address
echo "\n"
curl -X POST -H "Content-type: application/json" --data "{\"name\": \"courses\",\"required\": false,\"type\": \"Array\",\"subfields\": []}" $address
echo "\n"

sleep 2

address="http://localhost:$PORT/student"
curl -X POST -H "Content-type: application/json" --data "{\"sid\": \"db2987\",\"first_name\": \"Dustin\",\"last_name\": \"Burge\",\"school_name\": \"Columbia\",\"school_level\": \"University\",\"courses\": [\"COMS E6998\",\"COMS W4115\",\"COMS W4170\"]}" $address
echo "\n"
curl -X POST -H "Content-type: application/json" --data "{\"sid\": \"fmiller7\",\"first_name\": \"Frank\",\"last_name\": \"Miller\",\"school_name\": \"G. W. Carver\",\"school_level\": \"Elementary\"}" $address
echo "\n"
curl -X POST -H "Content-type: application/json" --data "{\"sid\": \"marzemil\",\"first_name\": \"Emily\",\"last_name\": \"Marzipan\",\"school_name\": \"Bronco High\",\"school_level\": \"High School\", \"courses\": [\"Underwater Basket Weaving\", \"Horseback Riding\"]}" $address
echo "\n"
