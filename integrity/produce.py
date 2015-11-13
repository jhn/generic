import time
 
from kafka import SimpleProducer, KafkaClient
from kafka.common import LeaderNotAvailableError
import json
 
def print_response(response=None):
    if response:
        print('Error: {0}'.format(response[0].error))
        print('Offset: {0}'.format(response[0].offset))
 
 
def main():
    kafka = KafkaClient("192.168.33.10:9092")
    producer = SimpleProducer(kafka)
 
    topic = b'test_test'
    # msg = "{'resource':'student','action':'added','id':'db2987','object':{'last':'burge','first':'dustin','courses':['COMS W4115','COMS W4170','COMS E6111'],'uni':'db2987'}}"
    #msg = "{resource:student,action:added,id:db2987,object:{last:burge,first:dustin,courses:[COMS W4115,COMS W4170,COMS E6111],uni:db2987}}"
    msgAdded = {"resource":"student","action":"added","id":"db2987","object":{"last":"burge","first":"dustin","courses":["COMSW4115","COMSW4170","COMSE6111"],"uni":"db2987"}}
    msgRemoved = {"resource":"student","action":"removed","id":"db2987"}
    #msgModified = 

    msg = msgRemoved

    try:
        print_response(producer.send_messages(topic, json.dumps(msg)))
    except LeaderNotAvailableError:
        # https://github.com/mumrah/kafka-python/issues/249
        time.sleep(1)
        print_response(producer.send_messages(topic, msg))
 
    kafka.close()
 
if __name__ == "__main__":
    main()