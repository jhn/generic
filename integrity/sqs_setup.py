#!/usr/local/bin/python

import os
import sys
import string
import traceback
import boto
from boto.sqs.connection import SQSConnection
from boto.sqs.message import Message
from integrityApp import app
from flask import render_template
from flask import request, abort, session
import json 
import requests

class sqsManager(object):
	def __init__(self, region, aws_id, aws_key):
		self.aws_id = aws_id
		self.aws_key = aws_key
		self.region = region
		conn = None
	
	def connect(self):
		self.conn = boto.sqs.connect_to_region(self.region, aws_access_key_id=self.aws_id, aws_secret_access_key=self.aws_key)
		return self.conn

	# def connect(self, region, aws_id, aws_key):
	#   self.conn = boto.sqs.connect_to_region(region, aws_access_key_id=aws_id, aws_secret_access_key=aws_key)
	#   return self.conn

	def getAllQ(self):
		queues = self.conn.get_all_queues()
		return queues

	# def getAllQ(self, conn):
	#   queues = conn.get_all_queues()
	#   return queues

	def getQ(self, qName):
		queue = self.conn.get_queue(qName)
		return queue

	# def getQ(self, conn, qName):
	#   queue = conn.get_queue(qName)
	#   return queue

	def getQCount(self, conn, qName):
		queue = conn.get_queue(qName)
		return queue.count()

	def createQueue(self, qName):
		queue = self.conn.create_queue(qName, 10)

		return queue

	def writeQueue(self, qName):

		queue = self.conn.get_queue(qName)

		for i in range(1,11):
			m = Message()
			m.set_body('This is message %d' %i)
			print ('This is message %d' %i)
			queue.write(m)

		return queue

	def readQueue(self, qName):
		
		qArr = []
		queue = self.conn.get_queue(qName)
		mm = queue.read(0)

		while True:

			qArr.append(mm.get_body())
			print ( mm.get_body())
			queue.delete_message(mm)
			mm = queue.read(0)

	def WriteToWriteQueue(self, writeQ, action, endpoint, body):

		m = Message()
		response =''

		if (action == 'GET'):
			response = requests.get(endpoint)

		elif (action == 'PUT'):
			response = requests.put(endpoint, data = body)

		elif(action == 'POST'):
			response = requests.post(endpoint, data = body)

		elif (action == 'DELETE'):
			response = requests.delete(endpoint)

		m.set_body(response)
		writeQ.write(m)


	def ReadWriteQueue(self, rName, wName):

		readQ = self.conn.get_queue(rName)
		writeQ = self.conn.get_queue(wName)

		while True: 
			rs = readQ.get_messages()

			if(len(rs) >= 1):
				
				m = rs[0]
				mb = m.get_body()
				json_body = json.loads(mb)
				print '--'
				print json_body
				print '--' 
				action = json_body['action']
				endpoint = json_body['endpoint']
				body = json_body['body']

				WriteToWriteQueue(writeQ, action, endpoint, body)

				readQ.delete_message(m)

# @application.route('/awsSQSJS')
# def awsSQSJS():
#   return render_template('awsSQSJS.html')

from config import aws_region, aws_id, aws_key
from config import Read_Queue, Write_Queue








@app.route('/awsSQS_setup')
def awsSQS():

	sm = sqsManager( aws_region, aws_id, aws_key )    
	conn = sm.connect()

	sm.ReadWriteQueue(Read_Queue, Write_Queue)

	return 'SQS Started'
