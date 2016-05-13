var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

const PORT = process.env.PORT || 9001;
const FB_TOKEN = "EAAX8hklBtXYBAP4Qj96PXpZCR0kQQ8oIZBy9Duc8W0NCiomLoLgqlTOAv6O4nNeZAGNxxgZCbHLlyebANm8dBUEW8k6mGNDcvcVueWo1RJMpsv6ygT2HrXPancbXLjpbAoiRs7Gq04hLxxQZBF6QLUJTNa8ZC9ZCe2rJIJvETz4bwZDZD";


app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.set('port', PORT);
app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === FB_TOKEN) {
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
            sendMessage(sender, "Echoing: " + text);
        }
    }
    res.sendStatus(200);
});


app.listen(app.get('port'), function () {
    console.log('Example app listening on port 3000!');
});

//
//
// Logic

var url = 'https://graph.facebook.com/v2.6/me/messages';

function sendMessage(sender, text) {
    var errHandler = function (err, res, body) {
        if (err) {
            console.log('err sending message', err);
        } else if (res.body.error) {
            console.log('err', err);

        }
    };
    request(
        {
            url: url,
            qs: {access_token: FB_TOKEN},
            method: 'POST',
            json: {
                recipient: {id: sender},
                message: {text: text}
            }
        },
        errHandler
    );
}