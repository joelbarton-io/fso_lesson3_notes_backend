const router = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')

router.post('/reset', async (request, response) => {
  await Note.deleteMany({})
  await User.deleteMany({})

  console.error({ message: 'deleted all notes and users from db' })
  response.status(204).end()
})

module.exports = router
