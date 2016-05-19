var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var firebase = require('firebase');
var app = express();

const PORT = process.env.PORT || 9001;
const FB_TOKEN = "EAAX8hklBtXYBAP4Qj96PXpZCR0kQQ8oIZBy9Duc8W0NCiomLoLgqlTOAv6O4nNeZAGNxxgZCbHLlyebANm8dBUEW8k6mGNDcvcVueWo1RJMpsv6ygT2HrXPancbXLjpbAoiRs7Gq04hLxxQZBF6QLUJTNa8ZC9ZCe2rJIJvETz4bwZDZD";
const userIds = {
    nuno: {
        id: 10206469184389272,
        name: 'Nuno'
    }
};

//
//
// Firebase

firebase.initializeApp({
    serviceAccount: "echo-world-404-64c374938a2f.json",
    databaseURL: "https://echo-world-404.firebaseio.com"
});

var db = firebase.database();
var connectsRef = db.ref('connects');

//
//
// Server logic

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.set('port', PORT);
app.get('/', function(req, res) {
    res.send('Hello World!');
});

app.get('/webhook/', function(req, res) {
    if (req.query['hub.verify_token'] === FB_TOKEN) {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong validation token');
});

app.post('/webhook/', function(req, res) {
    var messaging_events, i, event, sender, text;
    messaging_events = req.body.entry[0].messaging;
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i];
        sender = event.sender.id;
        console.log('Sender:', event.sender);
        if (event.postback) {
            text = JSON.stringify(event.postback);
            sendMessage(sender, 'Postback received:' + text);
            continue;
        }
        if (event.message && event.message.text) {
            text = event.message.text;
            console.log('Received message:', text);
            if (text === 'Generic') {
                sendGenericMessage(sender);
            } else {
                // Handle a text message from this sender
                sendMessage(sender, "Echoing: " + text);
            }
        }
    }
    res.sendStatus(200);
});

function newFirebaseModel(wifi) {
    var model = {};
    var id = wifi.ssid + '-' + Date.now();
    model[id] = wifi;
    return model;
}

app.post('/ifttt/home-wifi', function(req, res) {
    var obj = newFirebaseModel(req.body);
    connectsRef.set(obj, function(err) {
        if (err) {
            console.error('Firebase error:', err || '?');
            res.status(500).send('Firebase error:' + (err || '?'));
            return;
        }
        console.log('body:', req.body);
        var m = "Welcome home!";
        sendMessage(userIds.nuno.id, m);
    });
    res.sendStatus(200);
});

app.post('/ifttt/work-wifi', function(req, res) {
    var obj = newFirebaseModel(req.body);
    connectsRef.set(obj, function(err) {
        if (err) {
            console.error('Firebase error:', err || '?');
            res.status(500).send('Firebase error:' + (err || '?'));
            return;
        }
        console.log('body:', req.body);
        var m = "Have a nice one!";
        sendMessage(userIds.nuno.id, m);
    });
    res.sendStatus(200);
});

app.get('/fb/test', function(req, res) {
    var obj = {
        ssid: 'test',
        time: new Date().toString()
    };
    console.log('test:', obj);
    connectsRef.push().set(obj, function(err) {
        if (err) {
            console.error('Firebase error:', err || '?');
            res.status(500).send('Firebase error:' + (err || '?'));
            return;
        }
        var m = 'test';
        //sendMessage(userIds.nuno.id, m);    
    });
    res.sendStatus(200);
});

app.listen(app.get('port'), function() {
    console.log('Example app listening on port %d!', PORT);
});

//
//
// Logic

var url = 'https://graph.facebook.com/v2.6/me/messages';

function errHandler(err, res, body) {
    if (err) {
        console.log('err sending message', err);
    } else if (res.body.error) {
        console.log('err', err);
    }
}

function sendMessage(userId, text) {
    request({
            url: url,
            qs: {
                access_token: FB_TOKEN
            },
            method: 'POST',
            json: {
                recipient: {
                    id: userId
                },
                message: {
                    text: text
                }
            }
        },
        errHandler
    );
}

function sendGenericMessage(sender) {
    var messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "First card",
                    "subtitle": "Element #1 of an hscroll",
                    "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://www.messenger.com/",
                        "title": "Web url"
                    }, {
                        "type": "postback",
                        "title": "Postback",
                        "payload": "Payload for first element in a generic bubble"
                    }]
                }, {
                    "title": "Second card",
                    "subtitle": "Element #2 of an hscroll",
                    "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
                    "buttons": [{
                        "type": "postback",
                        "title": "Postback",
                        "payload": "Payload for second element in a generic bubble"
                    }]
                }]
            }
        }
    };
    request({
        url: url,
        qs: {
            access_token: FB_TOKEN
        },
        method: 'POST',
        json: {
            recipient: {
                id: sender
            },
            message: messageData
        }
    }, errHandler);
}
