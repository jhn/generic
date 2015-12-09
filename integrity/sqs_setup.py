#!/usr/local/bin/python

import os
import sys
import string
import traceback
import boto
from boto.sqs.connection import SQSConnection
from boto.sqs.message import Message
from rest_service import app
from flask import render_template
from flask import request, abort, session

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

      if (mm is None):
        break

    return qArr


