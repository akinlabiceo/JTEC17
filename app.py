# Copyright 2015 Josla Ltd. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import os
from flask import Flask, render_template, url_for, request, redirect, session
import json
from flask_socketio import SocketIO, emit
from watson_developer_cloud import ConversationV1
import urllib
import hashlib

app = Flask(__name__)
app.config.from_object(__name__)
app.config['SECRET_KEY'] = 'dinosaurs'

# SocketIO
socketio = SocketIO(app, async_mode='eventlet')
thread = None

# Watson Conversation
conversation = ConversationV1(
  username="********-****-****-****-************",
  password="************",
  version='2017-05-26'
)

workspace_id = '********-****-****-****-************'

context = {}
last_response = ""

# Views
@app.route("/")
def index():
    user_ip = request.remote_addr
    user_agent = request.headers.get('User-Agent')
    session['unique_conversation_id'] = str(user_ip) + "__" + str(user_agent)
    context["conversation_id"] = str(hashlib.sha256(session['unique_conversation_id'].encode('utf-8')).hexdigest())
    return render_template('index.html', async_mode=socketio.async_mode)

# Websocket
@socketio.on('my event')
def handleMessage(message):
    from_human_message = str(message["data"])
    global context
    global response

    bot_response = "...."
    intent = "...."
    try:
        context["conversation_id"] = str(hashlib.sha256(session['unique_conversation_id'].encode('utf-8')).hexdigest())
        response = conversation.message(workspace_id=workspace_id, message_input={'text': urllib.unquote(from_human_message)}, context=context)
        context = response["context"]

        if len(json.loads(json.dumps(response, indent=2))['intents']) > 0:
            intent = json.loads(json.dumps(response, indent=2))['intents'][0]['intent']
            if intent == "hello":
                try:
                    bot_response = ' '.join(response["output"]["text"])
                except Exception as ex:
                    print("exception :( ", ex)
            elif intent == "goodbye":
                try:
                    bot_response = ' '.join(response["output"]["text"])
                except Exception as ex:
                    print("exception :( ", ex)
            else:
                try:
                    bot_response = ' '.join(response["output"]["text"])
                except Exception as ex:
                    print("exception :( ", ex)

    except Exception as ex:
        print("watson exception :( ", ex)

    print("\n\nBOT SAYS: " + json.dumps(response))

    # sometimes the fucking bot doesn't answer what it should.
    if len(bot_response) < 2:
        bot_response = "I couldn't understand that. You can type 'help' for example"

    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my response', {'data': bot_response, 'intent': intent, 'count': session['receive_count']})

port = os.getenv('PORT', '5000')
if __name__ == "__main__":
	#app.run(host='0.0.0.0', port=int(port), debug=True)
	socketio.run(app, host='0.0.0.0', port=int(port), debug=True)
