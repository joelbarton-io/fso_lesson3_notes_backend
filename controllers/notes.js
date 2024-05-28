const notesRouter = require('express').Router()
const Note = require('../models/note')

notesRouter.get('/', async (req, res, next) => {
  try {
    const notes = await Note.find({})
    res.json(notes)
  } catch (e) {
    next(e)
  }
})

notesRouter.get('/:id', async (req, res, next) => {
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

notesRouter.post('/', async (req, res, next) => {
  try {
    const note = new Note({
      content: req.body.content,
      important: req.body.important,
    })
    const savedNote = await note.save() // this line is the place where it fails
    res.status(201).json(savedNote)
  } catch (e) {
    next(e)
  }
})

notesRouter.delete('/:id', async (req, res, next) => {
  try {
    await Note.findByIdAndDelete(req.params.id)
    res.status(204).end()
  } catch (e) {
    next(e)
  }
})

// was not working previously, losing key in frontend code??
notesRouter.put('/:id', async (req, res, next) => {
  try {
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
  } catch (e) {
    next(e)
  }
})

module.exports = notesRouter
