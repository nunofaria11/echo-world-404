var express = require('express');
var app = express();

const PORT = process.env.PORT || 9001;
const FB_WEB_HOOK = "my_token";

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === FB_WEB_HOOK) {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong validation token');
});

app.post('/webhook/', function (req, res) {
    var messaging_events, i, event, sender, text;
    messaging_events = req.body.entry[0].messaging;
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i];
        sender = event.sender.id;
        if (event.message && event.message.text) {
            text = event.message.text;
            // Handle a text message from this sender
            console.log('Received message:', text);
        }
    }
    res.sendStatus(200);
});


app.listen(PORT, function () {
    console.log('Example app listening on port 3000!');
});