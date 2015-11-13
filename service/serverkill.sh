#!/bin/sh

kill $(lsof -n -i4TCP:8001 | grep LISTEN | awk '{ print $2 }')
kill $(lsof -n -i4TCP:8002 | grep LISTEN | awk '{ print $2 }')
kill $(lsof -n -i4TCP:8003 | grep LISTEN | awk '{ print $2 }')
kill $(lsof -n -i4TCP:8004 | grep LISTEN | awk '{ print $2 }')
