var express = require('express');
var app = express();

const PORT = process.env.PORT || 9001;
const FB_WEB_HOOK = "my_token";

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === FB_WEB_HOOK) {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong validation token');
});


app.listen(PORT, function () {
    console.log('Example app listening on port 3000!');
});