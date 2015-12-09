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
			
			print "message received:\n"
			print message[1][3]
			print '-----------------------\n'
			self.processIncomingMessage(message)
			# Mark this message as fully consumed
			#consumer.task_done(message)

	 #   implemented what to do when messages come
	 #   for message in consumer:
	 #       print(message)

	def getAction(self, message):
		jsonfile = json.loads(message[1][3])

		return jsonfile['action']

	def getObject(self, message):
		jsonfile = json.loads(message[1][3])

		return jsonfile['object']

	def getOldObject(self, message):
		jsonfile = json.loads(message[1][3])

		return jsonfile['old_object']

	def getNewObject(self, message):
		jsonfile = json.loads(message[1][3])

		return jsonfile['new_object']

	def getResource(self, message):
		jsonfile = json.loads(message[1][3])

		return jsonfile['resource']

	def getID(self, message):
		jsonfile = json.loads(message[1][3])

		return jsonfile['id']

	def join_jsons(self, json1, json2):

		newList = []

		for it1 in json1:
			newList.append(it1)

		for it2 in json2:
			newList.append(it2)

		return newList

	def remove_json(self, jsonLong, json):

		newList = []

		for it in jsonLong :
			if it != json :
				newList.append(it)

		return newList

	def processIncomingMessage(self, message):

		resource = self.getResource(message)
		action = self.getAction(message)

		mappings = readMappings()
		print 'action ' + str(action)
		print 'resource ' + str(resource)
		
		if (self.sendActions(message, resource, action, mappings)):
		 	print 'actions delivered'
		else :
			print 'no action to deliver'

	def sendActions(self, message, resource, action, mappings):

		flag = False

		for lineitem in mappings:
			#print lineitem
			line = json.loads(lineitem)
			
			print line
			print line['event']
			print line['event']['resource']
			if(line["event"]["resource"] == resource and line["event"]["action"] == action):
				endpoint = line["action"]["endpoint"]
				field_name = line["action"]["field_name"]
				flag = True
				print 'endpoint: ' + str(endpoint)
				print 'field_name: ' + str(field_name)
				self.executeAction(message, resource, action, endpoint, field_name, line)
				
		return flag

	def executeAction(self, message, resource, action, endpoint, field_name, mapping):

		rID = self.getID(message)
		print "target id: " + str(rID)

		if ( action == 'removed'):
			print 'executing removed\n'
			
			result = requests.get(endpoint)
			resultjson = result.json()
			#resultfield = resultjson[field_name]

			for item in resultjson:

				newList = item[field_name]
				
				if rID in newList:
	
					putList = self.remove_json(newList, rID);
					final_endpoint = str(endpoint) + '/' + str(item['id'])

					itemresult = requests.put(final_endpoint, data = putlist)

		elif (action == 'added'):
			print 'executing added\n'
			modified_field_name = mapping['event']['modified_field_name']
			print 'modified_field_name: ' + str(modified_field_name)

			objectVar = self.getObject(message)
			modified_field_list = objectVar[modified_field_name]
			for element in modified_field_list:
				print element
				final_endpoint = str(endpoint) + '/' +str(element)
				print final_endpoint
				
#				GET Request
				reqGet = requests.get(endpoint)
				field_to_change = reqGet[field_name]
				print 'field_to_change: ' + str(field_to_change) + ' + '+ str(rId)

#				PUT Request
				putData = self.join_jsons(field_to_change, rID)
				putRes = requests.put(endpoint, data=json.dumps(putData))
	
		
		elif (action == 'modified'):
			print 'executing modified\n'
			modified_field_name = mapping['event']['modified_field_name']
			print 'modified_field_name: ' + str(modified_field_name)
			old_object = self.getNewObject(message)
			new_object = self.getOldObject(message)

			list_old = old_object[modified_field_name]
			list_new = new_object[modified_field_name]

			for deletes in list_old :
				final_endpoint = str(endpoint) + str('/') + str(deletes)
				result = requests.get(final_endpoint)

				#resultjson = result.json()
				#resultfield = resultjson[field_name]

				newList = result[field_name]	
				putList = self.remove_json(newList, rID);
				itemresult = requests.put(final_endpoint, data = putlist)

			for inserts in list_new:
				final_endpoint = str(endpoint) + str('/') + str(inserts)
				result = requests.get(final_endpoint)

				#resultjson = result.json()
				#resultfield = resultjson[field_name]

				newList = result[field_name]	
				putList = self.join_jsons(newList, rID);
				itemresult = requests.put(final_endpoint, data = putlist)


		else :
			print 'ERROR UNKNOWN ACTION'
			return 'NULL'

		dictToSend = {field_name:'what is the answer?'}
		#res = requests.post(endpoint, data=json.dumps(dictToSend))

		#return res.text
		return 'success'

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

@app.route('/config', methods=['GET', 'POST', 'PUT'])
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
	
	print "Consumer in Kafka is starting!"

	newConsumer = Consumer()

	newConsumer.start()

	return "Consumer in Kafka has started!"

# Make a web call to start  only Producer
@app.route('/startKafkaProducer', methods=['GET'])
def startKafkaProducer():
	newProducer = Producer()

	producer.start()

	return "Producer in Kafka has started!"	

# Make a web call to start Consumer and Producer
@app.route('/', methods=['GET'])
def index():

	# return "hello" 

	# parsed_json = json.loads(json_string)
	
	# threads = [
	# 	Producer(),
	# 	Consumer()
	# ]

	# for t in threads:
	# 	t.start()
	
	return "Producer and Consumer in Kafka has started!"

	time.sleep(5)

import sqs_setup

