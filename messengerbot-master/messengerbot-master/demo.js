var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var app = express()
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('9973512c1f434c67b1a47b7d2fcc47eb');
var news=[];
var token = "EAAElgNzc6VwBANiFvdPVv2kaC8sUkWQxDyyQlKPFlizP7aXDplBZAZBlPOFTSGxlreeuCqMoyJ9YjClps6PfRpLof4Dsadg41WrB80cjD9ebICA4JCQZC1oPoFpxA8OuLujSlY85QHkFItbMjGMNEWj7qyZC3F6RV1oOvp2WuqVButmekvRE"

app.set('port', (process.env.PORT || 8080))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
    res.send('bot is on')
})

app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'password') {
        res.send(req.query['hub.challenge'])
    }else{
    res.send('Error, wrong token')
  }
})

app.post('/webhook', function (req, res) {
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object == 'page') {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach(function(pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;

      // Iterate over each messaging event
      pageEntry.messaging.forEach(function(messagingEvent) {
        if (messagingEvent.message) {
          receivedMessage(messagingEvent);
        } else if (messagingEvent.delivery) {
          receivedDeliveryConfirmation(messagingEvent);
        } else if (messagingEvent.postback) {
          receivedPostback(messagingEvent);
        } else if (messagingEvent.read) {
          receivedMessageRead(messagingEvent);
        } else if (messagingEvent.account_linking) {
          receivedAccountLink(messagingEvent);
        }
          else {
          console.log("Webhook received unknown messagingEvent: ", messagingEvent);
        }


      });
    });

    res.sendStatus(200);
  }
});


function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:",
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var isEcho = message.is_echo;
  var messageId = message.mid;
  var appId = message.app_id;
  var metadata = message.metadata;

  // You may get a text or attachment but not both
  var messageText = message.text;
  var messageAttachments = message.attachments;
  var quickReply = message.quick_reply;

  if (isEcho) {
    // Just logging message echoes to console
    console.log("Received echo for message %s and app %d with metadata %s",
      messageId, appId, metadata);
    return;
  } else if (quickReply) {
    var quickReplyPayload = quickReply.payload;
    console.log("Quick reply for message %s with payload %s",
      messageId, quickReplyPayload);

    sendTextMessage(senderID, "Quick reply tapped");
    return;
  }

  if (messageText) {

    // If we receive a text message, check to see if it matches any special
    // keywords and send back the corresponding example. Otherwise, just echo
    // the text we received.
    switch (messageText.replace(/[^\w\s]/gi, '').trim().toLowerCase()) {
      case 'hello':
      case 'hi':
        sendHiMessage(senderID);
        break;

      case 'news':
        sendButtonMessage(senderID);
        break;

      default:
        sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}

function receivedDeliveryConfirmation(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var delivery = event.delivery;
  var messageIDs = delivery.mids;
  var watermark = delivery.watermark;
  var sequenceNumber = delivery.seq;

  if (messageIDs) {
    messageIDs.forEach(function(messageID) {
      console.log("Received delivery confirmation for message ID: %s",
        messageID);
    });
  }

  console.log("All message before %d were delivered.", watermark);
}

function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback
  // button for Structured Messages.
//  var payload = event.postback.payload;


    if(event.postback.payload === 'PAYLOAD:tech_news'){
      news_tech(senderID)
    }
    if(event.postback.payload === 'PAYLOAD:sport_news'){
      news_sport(senderID)
    }
    if(event.postback.payload === 'PAYLOAD:enter_news'){
      news_enter(senderID)

  }


}

/*
 * Message Read Event
 *
 * This event is called when a previously-sent message has been read.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-read
 *
 */
function receivedMessageRead(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  // All messages before watermark (a timestamp) or sequence have been seen.
  var watermark = event.read.watermark;
  var sequenceNumber = event.read.seq;

  console.log("Received message read event for watermark %d and sequence " +
    "number %d", watermark, sequenceNumber);
}

/*
 * Account Link Event
 *
 * This event is called when the Link Account or UnLink Account action has been
 * tapped.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/account-linking
 *
 */
function receivedAccountLink(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  var status = event.account_linking.status;
  var authCode = event.account_linking.authorization_code;

  console.log("Received account link event with for user %d with status %s " +
    "and auth code %s ", senderID, status, authCode);
}


function news_tech(recipientId){

  newsapi.v2.topHeadlines({
  //sources: 'bbc-news',
  //  q: '',
    category: 'technology',
    language: 'en',
    country: 'us'
  }).then(response => {
    for(let i=0;i<5;i++){
      news[i]=response.articles[i].title
      console.log(news[i]);
      sendTextMessage(recipientId,news[i])
  }


  });

}
function news_sport(recipientId){

  newsapi.v2.topHeadlines({
  //sources: 'bbc-news',
  //  q: '',
    category: 'sports',
    language: 'en',
    country: 'us'
  }).then(response => {
    for(let i=0;i<5;i++){
      news[i]=response.articles[i].title
      console.log(news[i]);
      sendTextMessage(recipientId,news[i])
    }

    });


}
function news_enter(recipientId){

  newsapi.v2.topHeadlines({
  //sources: 'bbc-news',
  //  q: '',
    category: 'entertainment',
    language: 'en',
    country: 'us'
  }).then(response => {
    for(let i=0;i<5;i++){
      news[i]=response.articles[i].title
      console.log(news[i]);
      sendTextMessage(recipientId,news[i])
  }

  });

}

function sendHiMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: `
      hi,this is Cool Bot at your service
      `
    }
  }

  callSendAPI(messageData);
}

/*
 * Send a text message using the Send API.
 *
 */
function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText,
      metadata: "DEVELOPER_DEFINED_METADATA"
    }
  };

  callSendAPI(messageData);
}

function sendButtonMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "rift",
            subtitle: "DJ in Taylor Swift groping lawsuit lands new gig in Mississippi",
            item_url: "https://www.cbsnews.com/news/taylor-swift-groping-lawsuit-dj-david-mueller-new-job-greenwood-mississippi/",
            image_url: "https://cbsnews2.cbsistatic.com/hub/i/r/2017/08/11/b116c2db-a906-44c5-9e04-2b47d9fdfb6c/thumbnail/1200x630/8ba829b589bddaeb4833c0e9e00de6d9/170810-jeff-kandyba-courtroom-taylor-swift.jpg",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/rift/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for first bubble",
            }],
          }, {
            title: "touch",
            subtitle: "Your Hands, Now in VR",
            item_url: "https://www.oculus.com/en-us/touch/",
            image_url: "https://images.pexels.com/photos/34950/pexels-photo.jpg?h=350&auto=compress&cs=tinysrgb",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/touch/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for second bubble",
            }]
          }]
        }
      }
    }
  };

  callSendAPI(messageData);
}


function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: token },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      if (messageId) {
        console.log("Successfully sent message with id %s to recipient %s",
          messageId, recipientId);
      } else {
      console.log("Successfully called Send API for recipient %s",
        recipientId);
      }
    } else {
      console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
    }
  });
}







app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
