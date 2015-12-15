#!/bin/sh

./serverkill_finance.sh

PORT=8099 services/finance.sh
