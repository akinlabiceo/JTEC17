// Build send message with HTML
function buildMessageSend(text) {
  var element = document.createElement('div');

  element.classList.add('message', 'sent');

  element.innerHTML = text +
  '<span class="metadata">' +
  '<span class="time">' + moment().format('h:mm A') + '</span>'
  '</span>';

  return element;
}

// Build receive message with HTML
function buildMessageRecieve(text) {
  var element = document.createElement('div');

  element.classList.add('message', 'received');

  element.innerHTML = text +
  '<span class="metadata">' +
  '<span class="time">' + moment().format('h:mm A') + '</span>'
  '</span>';

  return element;
}

// Build hello message attachment
function buildCapabilityAttachment() {
  var element = document.createElement('div');

  element.classList.add('message', 'attachment');

  element.innerHTML = '<div class="app-attachment">' +
    '<a type="submit" class="btn btn-primary btn-lg btn-md btn-sm btn-xs btn-chat" id="getStarted"><span class="glyphicon glyphicon-log-in"></span>    Get Started</a>' +
    '<a type="submit" class="btn btn-primary btn-lg btn-md btn-sm btn-xs btn-chat" id="findAtm"><span class="glyphicon glyphicon-map-marker"></span>    Find ATM</a>' +
    '<a type="submit" class="btn btn-primary btn-lg btn-md btn-sm btn-xs btn-chat" id="payBill"><span class="glyphicon glyphicon-credit-card"></span>    Pay Bills</a>' +
    '<a type="submit" class="btn btn-primary btn-lg btn-md btn-sm btn-xs btn-chat" id="analyseSpend"><span class="glyphicon glyphicon-signal"></span>   Analyse Spend</a>' +
  '</div>';

  return element;
}

$(document).ready(function(){

  var conversation = document.querySelector('#conversations');
  var inputChat = document.querySelector('#inputChat');

  // Initialise websocket
  var socket = io.connect('http://' + document.domain + ':' + location.port);

  socket.on('connect', function() {
		console.log('User has connected!');
	});

  // Initialise watson conversation
  var text = "Hello"

  socket.emit('my event', {data: text});

  // ChatBot response message
  socket.on('my response', function(msg) {
    var text = msg.data;

    if (msg.intent == "hello") {
      var message = buildMessageRecieve(text);
      conversation.appendChild(message);
      var attachment = buildCapabilityAttachment();
      conversation.appendChild(attachment);
    } else if (msg.intent == "goodbye") {
      var message = buildMessageRecieve(text);
      conversation.appendChild(message);
      var attachment = buildCapabilityAttachment();
      conversation.appendChild(attachment);
    } else {
      var message = buildMessageRecieve(text);
      conversation.appendChild(message);
    }

    conversation.scrollTop = conversation.scrollHeight;

		console.log('Received message');
	});

  // User click to send input
  $("#send").on("click", function(e){
    var text = inputChat.value;
    if (inputChat.value) {
      var message = buildMessageSend(text);
      conversation.appendChild(message);
    }

    socket.emit('my event', {data: text});

    inputChat.value = '';
    conversation.scrollTop = conversation.scrollHeight;

    e.preventDefault();
  });

  //User press enter to send input
  $('#inputChat').keypress(function (e) {
    var key = e.which;
    var text = inputChat.value;

    if(key == 13)  // the enter key code
    {
      if (inputChat.value) {
        var message = buildMessageSend(text);
        conversation.appendChild(message);
      }

      //socket.send(text);
      socket.emit('my event', {data: text});

      inputChat.value = '';
      conversation.scrollTop = conversation.scrollHeight;

      e.preventDefault();
    }
  });

});
