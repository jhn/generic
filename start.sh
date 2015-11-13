 #!/usr/bin/env bash

echo "Registering services"
curl -X POST http://localhost:3000/register --data '{"name": "students-a-f", "regex": "/student/[a-f]", "out": "160.39.182.146:8001"}' --header "Content-type:application/json"
echo ""
sleep 1
curl -X POST http://localhost:3000/register --data '{"name": "students-g-m", "regex": "/student/[g-m]", "out": "160.39.182.146:8002"}' --header "Content-type:application/json"
echo ""
sleep 1
curl -X POST http://localhost:3000/register --data '{"name": "students-n-z", "regex": "/student/[n-z]", "out": "160.39.182.146:8003"}' --header "Content-type:application/json"
echo ""
sleep 1
curl -X POST http://localhost:3000/register --data '{"name": "courses", "regex": "/course", "out": "160.39.182.146:8004"}' --header "Content-type:application/json"
echo ""
sleep 1
echo "Current status"
curl http://localhost:3000/status
echo ""
sleep 1
echo "Starting HAProxy"
curl -X POST http://localhost:3000/start
echo ""
cowsay "Started!"
