const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
require('dotenv').config()
const Note = require('./models/note')

const app = express()
app.use(express.static('dist'))
app.use(express.json())
app.use(cors())

// eslint-disable-next-line no-unused-vars
morgan.token('body', (req, res) => JSON.stringify(req.body))
app.use(morgan('MORGAN-> :method :url :status :response-time :body'))

app.get('/', (req, res) => res.send('<h1>Notes App</h1>'))

app.get('/api/notes', async (req, res, next) => {
  try {
    const notes = await Note.find({})
    res.json(notes)
  } catch (e) {
    next(e)
  }
})

app.post('/api/notes', async (req, res, next) => {
  try {
    const note = new Note({
      content: req.body.content,
      important: req.body.important,
    })

    console.log('note from inside router ->', note)
    // res.status(404).end();
    const savedNote = await note.save() // this line is the place where it fails

    res.status(201).json(savedNote)
  } catch (e) {
    console.log('RIGHT HERE')
    next(e)
  }
})

app.get('/api/notes/:id', async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id)
    if (note) {
      return res.json(note)
    }
    // what about here though? another response?
  } catch (e) {
    next(e)
  }
})

app.delete('/api/notes/:id', async (req, res, next) => {
  try {
    await Note.findByIdAndDelete(req.params.id)
    res.status(204).end()
  } catch (e) {
    next(e)
  }
})

// was not working previously, losing key in frontend code??
app.put('/api/notes/:id', async (req, res, next) => {
  try {
    const { content, important } = req.body

    const updated = await Note.findByIdAndUpdate(
      req.params.id,
      {
        content,
        important,
      },
      {
        new: true,
        runValidators: true,
        context: 'query',
      }
    )
    res.json(updated)
  } catch (e) {
    next(e)
  }
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)
const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`)
})
