const notesRouter = require('express').Router()
const Note = require('../models/note')

notesRouter.get('/', async (req, res) => {
  const notes = await Note.find({})
  res.json(notes)
})

notesRouter.get('/:id', async (req, res) => {
  const note = await Note.findById(req.params.id)
  if (note) {
    return res.status(200).json(note)
  }
  return res.status(404).end()
})

notesRouter.post('/', async (req, res) => {
  const note = new Note({
    content: req.body.content,
    important: req.body.important || false,
  })
  const savedNote = await note.save()
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
