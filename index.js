var express = require('express');
var app = express();

const PORT = process.env.PORT || 9001;

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.listen(PORT, function () {
    console.log('Example app listening on port 3000!');
});