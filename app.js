const express = require('express');
var bodyParser = require('body-parser');

const dashboardPage = require('./pages/dashBoard');

const PORT = process.env.PORT || 3007;

const app = express();
var jsonParser = bodyParser.json();

app.use(express.static(__dirname + '/public'));
app.get('/', dashboardPage);

let httpServer = app.listen(PORT, () => {
  console.log(`Server is running on localhost:${PORT}`);
});
