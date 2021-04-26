from flask import Flask, request, make_response
import requests
import uuid
import sys

app = Flask(__name__)

#https://hackersandslackers.com/flask-routes/

@app.route('/create')
def createIdentifier():
	graph=request.args.get("graph")
	prefix=request.args.get("prefix")


	#check existing identifiers
	newid=uuid.uuid4()
	response=make_response(prefix + newid.hex, 200)
	response.mimetype="text/plain"

	return response 

