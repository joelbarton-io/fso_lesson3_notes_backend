const { test, after, beforeEach } = require('node:test')
const Note = require('../models/note')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const initialNotes = [
  {
    content: 'HTML is easy',
    important: false,
  },
  {
    content: 'Browser can execute only JavaScript',
    important: true,
  },
]

beforeEach(async () => {
  await Note.deleteMany({})
  await Note.insertMany(initialNotes)
})

test('notes are returned as json', async () => {
  await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('there are 3 notes', async () => {
  const res = await api.get('/api/notes')
  assert.ok(res.body.length, initialNotes.length)
})

test('the first note is about HTTP methods', async () => {
  const res = await api.get('/api/notes')
  const contents = res.body.map((e) => e.content)
  assert(contents.includes(initialNotes[0].content))
})

after(async () => {
  await mongoose.connection.close()
})
