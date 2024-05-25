const config = require('./utils/config')
const express = require('express')
const app = require('./app')
const cors = require('cors')
const notesRouter = require('./controllers/notes')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)
logger.info('connecting to...', config.MONGODB_URI)

mongoose
  .connect(config.MONGODB_URI)
  .then((res) => {
    logger.info(
      `successfully connected to mongodb cluster ${res.connections[0].name}`
    )
  })
  .catch((error) => {
    logger.error(
      'failed to connect to mongodb cluster, REASON:',
      error.message
    )
  })

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(middleware.requestLogger)
app.use('/api/notes', notesRouter)

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(middleware.errorHandler)
module.exports = app