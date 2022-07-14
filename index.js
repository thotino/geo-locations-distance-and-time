const express = require('express');
const bodyParser = require('body-parser');

const { getDistanceAndTime } = require('./controllers/geo.controller')

const app = express();

app.use(bodyParser.json());


app.post('/api/distance_and_time', getDistanceAndTime)

app.listen(3000, () => {
  console.log('Server is up on port 3000');
});

module.exports = app;
