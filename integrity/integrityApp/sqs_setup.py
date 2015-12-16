#!/usr/local/bin/python

# Emre Ozen 2015

import os
import sys
import string
import traceback
import boto
from boto.sqs.connection import SQSConnection
from boto.sqs.message import Message, RawMessage
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

  def getAllQ(self):
    queues = self.conn.get_all_queues()
    return queues

  def getQ(self, qName):
    queue = self.conn.get_queue(qName)
    return queue

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

  def WriteToWriteQueue(self, action, endpoint, body, headers, message_id, output_queue):

    writeQ = self.conn.get_queue(str(output_queue))

    m = RawMessage()
    response =''

    if (action == 'GET'):
      response = requests.get(endpoint, headers=headers)

    elif (action == 'PUT'):
      response = requests.put(endpoint, data = json.dumps(body), headers=headers)

    elif(action == 'POST'):
      response = requests.post(endpoint, data = json.dumps(body),  headers=headers)

    elif (action == 'DELETE'):
      response = requests.delete(endpoint, headers=headers)

    print response.text

    response_final = {
      'messageId': str(message_id),
      'response': str(response.text)
    }

    m.set_body(json.dumps(response_final)) 
    writeQ.write(m)

  def ReadWriteQueue(self, rName):

    readQ = self.conn.get_queue(rName)

    while True: 
      rs = readQ.get_messages()

      if(len(rs) >= 1):
        
        m = rs[0]
        mb = m.get_body()
        json_body = json.loads(mb)

        action = json_body['action']
        endpoint = json_body['endpoint']
        body = json_body['body']
        headers = json_body['headers']
        message_id = json_body['message_id']
        output_queue = json_body['output_queue']

        self.WriteToWriteQueue(action, endpoint, body, headers, message_id, output_queue)

        readQ.delete_message(m)


from config import aws_region, aws_id, aws_key
from config import Read_Queue

@app.route('/awsSQS_setup')
def awsSQS():

  sm = sqsManager( aws_region, aws_id, aws_key )    
  conn = sm.connect()

  sm.ReadWriteQueue(Read_Queue)

  return 'SQS Started'


