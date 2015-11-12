from integrityApp import app
import json
from flask import request, jsonify
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
from config import data_file_name

def appendToFile(data):
	with open(data_file_name, 'a+') as outfile:
		 json.dump(data, outfile)
	outfile = open(data_file_name,"a+")
	outfile.write("\n")
	outfile.close() 


def editFile(data):
	filedata = []
	with open(data_file_name, 'r+') as outfile:
		print 'opened file'
		for line in outfile:
			tempLine = json.loads(line)
			
			#print data["event"]

			if(tempLine["event"] == data["event"]):
				newLine = json.dumps(data)
				filedata.append(newLine)
			else :
				filedata.append(json.dumps(tempLine))

	outfile = open(data_file_name,"w")
	for line in filedata:
		print line
		outfile.write("%s\n" % line)
	outfile.close() 

@app.route('/indexPost', methods=['GET', 'POST', 'PUT'])
def indexPost():
	if not request.json or not 'event' in request.json:
		abort(400)

	if request.method == 'POST':
		appendToFile(request.json)
		print 'POST request done'
	if request.method == 'PUT':
		editFile(request.json)
		print 'PUT request'

	return jsonify({'result': True}), 200

@app.route('/', methods=['GET', 'POST', 'PUT'])
def index(json_string):

	parsed_json = json.loads(json_string)
	
	# threads = [
 #        Producer(),
 #        Consumer()
 #    ]

 #    for t in threads:
 #        t.start()

 #    time.sleep(5)
	
	# return "Hello, World!"

#  parsed_json = json.loads(json_string

#   connQueue = boto.sqs.connect_to_region("us-east-1", aws_access_key_id=aws_access_key_id,aws_secret_access_key=aws_secret_access_key )
#   connSns = boto.sns.connect_to_region("us-east-1", aws_access_key_id=aws_access_key_id,aws_secret_access_key=aws_secret_access_key )
	
#   genericQueue = conn.get_queue('genericQueue')

