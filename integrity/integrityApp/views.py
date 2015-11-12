from integrityApp import app
import json
from flask import request, jsonify
#import boto
from kafka.client import KafkaClient
from kafka.consumer import SimpleConsumer
from kafka.producer import SimpleProducer
import threading, logging, time
import requests

from config import kafka_address, kafka_group, kafka_topic

class Consumer(threading.Thread):
	daemon = True

	def run(self):
		client = KafkaClient(kafka_address)
		consumer = SimpleConsumer(client, kafka_group, kafka_topic)

		for message in consumer:
			processIncomingMessage(message)

	 #   implemented what to do when messages come
	 #   for message in consumer:
	 #       print(message)

	def processIncomingMessage(message):

		event = getEvent(message)
		mappings = readMappings()

		if (sendActions(event, mappings)):
			print 'actions delivered'
		else :
			print 'no action to deliver'

	def sendActions(event, mappings):

		flag = False

		for line in mappings:
			if(line["event"] == event):
				endpoint = line["endpoint"]
				field_name = line["field_name"]
				executeAction(endpoint, field_name)
				flag = True

		return flag

	def executeAction(endpoint, field_name):
		dictToSend = {field_name:'what is the answer?'}
		res = requests.post(endpoint, data=json.dumps(dictToSend))

		return res.text


class Producer(threading.Thread):
	daemon = True

	def run(self):
			client = KafkaClient(kafka_address)
			producer = SimpleProducer(client)

		#  this is to test when messages come
		#  implement what to do when needed to send messages
		#  while True:
		#     producer.send_messages('generic-topic', "test")
		#     producer.send_messages('generic-topic', "\xc2Hola, mundo!")

		#     time.sleep(1)


#from config import aws_access_key_id, aws_secret_access_key 
from config import data_file_name

def readMappings():
	filedata = []
	with open(data_file_name, 'r') as outfile:
		for line in outfile:
			filedata.append(line)

	return filedata

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

from kafka.client import KafkaClient
from kafka.consumer import SimpleConsumer


def kafkaConsume():

	consumer.max_buffer_size=0
	consumer.seek(0,2)
	for message in consumer:
		print("OFFSET: "+str(message[0])+"\t MSG: "+str(message[1][3]))



# Make a web call to start  only Consumer
@app.route('/startKafkaConsumer', methods=['GET'])
def startKafkaConsumer():
	newConsumer = Consumer()

	consumer.start()

	return "Consumer in Kafka has started!"

# Make a web call to start  only Producer
@app.route('/startKafkaProducer', methods=['GET'])
def startKafkaProducer():
	newProducer = Producer()

	producer.start()

	return "Producer in Kafka has started!"	

# Make a web call to start Consumer and Producer
@app.route('/', methods=['GET'])
def index(json_string):

	parsed_json = json.loads(json_string)
	
	threads = [
		Producer(),
		Consumer()
	]

	for t in threads:
		t.start()
	
	return "Producer and Consumer in Kafka has started!"

	time.sleep(5)


