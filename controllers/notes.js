const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTokenFrom = (request) => {
  const auth = request.get('authorization')
  if (auth && auth.startsWith('Bearer ')) {
    return auth.replace('Bearer ', '')
  }
  return null
}
notesRouter.get('/', async (request, response) => {
  const notes = await Note.find({}).populate('user', { username: 1, name: 1 })

  response.json(notes)
})

notesRouter.get('/:id', async (req, res) => {
  const note = await Note.findById(req.params.id)
  if (note) {
    return res.status(200).json(note)
  }
  return res.status(404).end()
})

notesRouter.post('/', async (req, res) => {
  const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET)
  if (!decodedToken.id) {
    return res.status(401).json({ error: 'token invalid' })
  }
  const user = await User.findById(decodedToken.id)

  const note = new Note({
    content: req.body.content,
    important: req.body.important === undefined ? false : req.body.important,
    user: user.id,
  })

  const savedNote = await note.save()
  user.notes = user.notes.concat(savedNote._id)
  await user.save()
  res.status(201).json(savedNote)
})

notesRouter.delete('/:id', async (req, res) => {
  await Note.findByIdAndDelete(req.params.id)
  res.status(204).end()
})

notesRouter.put('/:id', async (req, res) => {
  const id = req.params.id
  const note = {
    content: req.body.content,
    important: req.body.important,
  }
  const options = {
    new: true,
    runValidators: true,
    context: 'query',
  }

  const updated = await Note.findByIdAndUpdate(id, note, options)
  res.json(updated)
})

module.exports = notesRouter
