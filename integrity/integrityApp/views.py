from integrityApp import app
import json
#import boto
from kafka.client import KafkaClient
from kafka.consumer import SimpleConsumer
from kafka.producer import SimpleProducer
import threading, logging, time

class Consumer(threading.Thread):
    daemon = True

    def run(self):
        client = KafkaClient("localhost:9092")
        consumer = SimpleConsumer(client, "generic-group", "generic-topic")

     #   implement what to do when messages come
     #   for message in consumer:
     #       print(message)

class Producer(threading.Thread):
    daemon = True

    def run(self):
        client = KafkaClient("localhost:9092")
        producer = SimpleProducer(client)


        #   implement what to do when needed to send messages
        # while True:
        #     producer.send_messages('generic-topic', "test")
        #     producer.send_messages('generic-topic', "\xc2Hola, mundo!")

        #     time.sleep(1)


from config import aws_access_key_id, aws_secret_access_key 

@app.route('/', methods=['GET', 'POST'])
def index(json_string):

	parsed_json = json.loads(json_string)
	
	threads = [
        Producer(),
        Consumer()
    ]

    for t in threads:
        t.start()

    time.sleep(5)
    
    return "Hello, World!"

#  parsed_json = json.loads(json_string

# 	connQueue = boto.sqs.connect_to_region("us-east-1", aws_access_key_id=aws_access_key_id,aws_secret_access_key=aws_secret_access_key )
# 	connSns = boto.sns.connect_to_region("us-east-1", aws_access_key_id=aws_access_key_id,aws_secret_access_key=aws_secret_access_key )
	
# 	genericQueue = conn.get_queue('genericQueue')

