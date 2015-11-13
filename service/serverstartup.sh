#!/bin/sh

./serverkill.sh

PORT=8001 services/student.sh
PORT=8002 services/student.sh
PORT=8003 services/student.sh
PORT=8004 services/course.sh
