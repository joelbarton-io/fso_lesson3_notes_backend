const { test, describe, after, beforeEach } = require('node:test')
const Note = require('../models/note')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

beforeEach(async () => {
  await Note.deleteMany({})

  let noteObject = new Note(helper.initialNotes[0])
  await noteObject.save()

  noteObject = new Note(helper.initialNotes[1])
  await noteObject.save()
})

describe('General', () => {
  test('notes are returned as json', async () => {
    await api
      .get('/api/notes')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all notes are returned', async () => {
    const res = await api.get('/api/notes')
    assert.ok(res.body.length, helper.initialNotes.length)
  })

  test('a specific note is amongst the returned notes', async () => {
    const res = await api.get('/api/notes')
    const contents = res.body.map((e) => e.content)
    assert(contents.includes(helper.initialNotes[0].content))
  })
})

describe('Routes ', () => {
  test('POST (a valid note)...', async () => {
    const dummyNote = {
      content: 'async/await simplifies making async calls',
      important: true,
    }

    await api
      .post('/api/notes')
      .send(dummyNote)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const notesAtEnd = await helper.notesInDb()
    const contents = notesAtEnd.map((r) => r.content)

    assert.equal(notesAtEnd.length, helper.initialNotes.length + 1)
    assert(contents.includes(dummyNote.content))
  })

  test('POST (a note without content)...', async () => {
    const dummyNote = { important: false }

    api.post('/api/notes').send(dummyNote).expect(400)

    const notesAtEnd = await helper.notesInDb()
    assert.ok(notesAtEnd.length, helper.initialNotes.length)
  })

  test('GET (a valid note)', async () => {
    const notes = await helper.notesInDb()
    const note = notes.at(0)
    const res = await api
      .get(`/api/notes/${note.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert(res.body.id === note.id)
    assert.deepStrictEqual(res.body, note)
  })

  test('Delete (a valid note)...', async () => {
    const notesStart = await helper.notesInDb()
    const note = notesStart.at(0)
    const ID = note.id

    await api.delete(`/api/notes/${ID}`).expect(204)

    const notesEnd = await helper.notesInDb()
    const contents = notesEnd.map((r) => r.content)
    assert(!contents.includes(note.content))
    assert.ok(notesEnd.length, helper.initialNotes.length - 1)
  })
})

after(async () => {
  await mongoose.connection.close()
})
