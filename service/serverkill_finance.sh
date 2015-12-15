#!/bin/sh

kill $(lsof -n -i4TCP:8099 | grep LISTEN | awk '{ print $2 }')
