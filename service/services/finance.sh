#!/bin/sh

export GENERIC_SERVICE_PORT=$PORT
export GENERIC_RESOURCE_NAME=loan
export GENERIC_RESOURCE_ID_NAME=lid
export GENERIC_RESOURCE_ID_TYPE=String
export GENERIC_KAFKA_ZK=localhost:2181
export GENERIC_KAFKA_TOPIC=test

cmd="node app.js"

$cmd &

sleep 3

address="http://localhost:$PORT/loan/config/field"
curl -X POST -H "Content-type: application/json" -H "tenantId: Fidelity" --data "{\"name\": \"policy_owner\",\"required\": true,\"type\": \"String\",\"subfields\": []}" $address
curl -X POST -H "Content-type: application/json" -H "tenantId: Fidelity" --data "{\"name\": \"local_branch\",\"required\": true,\"type\": \"String\",\"subfields\": []}" $address
curl -X POST -H "Content-type: application/json" -H "tenantId: Fidelity" --data "{\"name\": \"remaining_loan_balance\",\"required\": true,\"type\": \"Number\",\"subfields\": []}" $address
curl -X POST -H "Content-type: application/json" -H "tenantId: JPMChase" --data "{\"name\": \"loan_holder\",\"required\": true,\"type\": \"String\",\"subfields\": []}" $address
curl -X POST -H "Content-type: application/json" -H "tenantId: JPMChase" --data "{\"name\": \"advisor\",\"required\": true,\"type\": \"String\",\"subfields\": []}" $address
curl -X POST -H "Content-type: application/json" -H "tenantId: JPMChase" --data "{\"name\": \"policy_type\",\"required\": true,\"type\": \"String\",\"subfields\": []}" $address
curl -X POST -H "Content-type: application/json" -H "tenantId: JPMChase" --data "{\"name\": \"remaining_balance\",\"required\": true,\"type\": \"Number\",\"subfields\": []}" $address


sleep 2

address="http://localhost:$PORT/loan"
curl -X POST -H "Content-type: application/json" -H "tenantId: Fidelity" --data "{\"remaining_loan_balance\": 1000000.01,\"local_branch\": \"123 Close By Street, New York, NY 10000\",\"policy_owner\": \"Baggins, Bilbo\",\"lid\": \"12347890\"}" $address
curl -X POST -H "Content-type: application/json" -H "tenantId: Fidelity" --data "{\"remaining_loan_balance\": 28.15,\"local_branch\": \"678 Around The Corner Ln, Houston, TX 77004\",\"policy_owner\": \"Potter, Harry\",\"lid\": \"87654321\"}" $address
curl -X POST -H "Content-type: application/json" -H "tenantId: Fidelity" --data "{\"remaining_loan_balance\": 56002.14,\"local_branch\": \"555 Blueberry Ridge, Milwaukee, WI 88899\",\"policy_owner\": \"F, Guy\",\"lid\": \"00009999\"}" $address
curl -X POST -H "Content-type: application/json" -H "tenantId: JPMChase" --data "{\"remaining_balance\": 11.53,\"advisor\": \"Smarty Pants, CPA\",\"loan_holder\": \"George, Fred\",\"policy_type\":\"Student Loan\",\"lid\": \"abc123\"}" $address
curl -X POST -H "Content-type: application/json" -H "tenantId: JPMChase" --data "{\"remaining_balance\": 5555.55,\"advisor\": \"Bob Belcher\",\"loan_holder\": \"Ice T\",\"policy_type\":\"Home Loan\",\"lid\": \"ice733\"}" $address
