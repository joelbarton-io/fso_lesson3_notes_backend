/* mongoose setup:
    access mongoose module
    configure mongoose options
    connect to the cluster via the url
    create document? schema
    - modify schema with set() to change how data is rendered with `toJSON`
    create a model constructor based on schema
    use constructor to create db data
*/
require('dotenv').config()
const mongoose = require('mongoose')
const logger = require('./utils/logger')
const Note = require('./models/note')
const User = require('./models/user')
const uri = process.env.MONGODB_URI

mongoose.set('strictQuery', false)

mongoose
  .connect(uri)
  .then((res) => {
    logger.info(
      `successfully connected to mongodb cluster ${res.connections[0].name}`
    )
  })
  .catch((error) => {
    logger.error('failed to connect to mongodb cluster, REASON:', error.message)
  })

const notes = [
  {
    content: 'HTML is easy',
    important: true,
  },
  {
    content: 'Browser can execute only JavaScript',
    important: false,
  },
  {
    content: 'GET and POST are the most important methods of HTTP protocol',
    important: true,
  },
]
const users = [
  {
    username: 'root',
    user: 'rootytooty',
    password: '123',
  },
]

User.insertMany(users).then((res) => {
  logger.info(res)
  logger.info(`added ${users.length} users to the users database`)
})

Note.insertMany(notes).then((res) => {
  logger.info(res)
  logger.info(`added ${notes.length} notes to the notes database`)
  mongoose.connection.close()
})
