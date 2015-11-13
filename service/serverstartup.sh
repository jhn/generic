#!/bin/sh

./serverkill.sh

PORT=8001 services/student.sh
PORT=8002 services/student.sh
PORT=8003 services/student.sh
PORT=8004 services/course.sh

sleep 5

address="http://localhost:8001/config/field"
curl -X POST -H "Content-type: application/json" --data "{\"name\": \"first\",\"required\": true,\"type\": \"String\",\"subfields\": []}" $address
curl -X POST -H "Content-type: application/json" --data "{\"name\": \"last\",\"required\": true,\"type\": \"String\",\"subfields\": []}" $address
curl -X POST -H "Content-type: application/json" --data "{\"name\": \"courses\",\"required\": true,\"type\": \"Array\",\"subfields\": []}" $address
