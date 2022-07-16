const express = require('express');
const bodyParser = require('body-parser');
const { verifyRequest } = require('./middlewares')
const { getDistanceAndTime } = require('./controllers/geo.controller')

const { port: PORT } = require('./config')

const app = express()

app.use(bodyParser.json())


app.post('/api/distance_and_time', [ verifyRequest ], getDistanceAndTime)

app.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}`)
})

module.exports = app;
