const { test, describe, after, beforeEach } = require('node:test')
const Note = require('../models/note')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')

const app = require('../app')
const api = supertest(app)

describe('when there is initially some notes saved', () => {
  beforeEach(async () => {
    await Note.deleteMany({})
    await Note.insertMany(helper.initialNotes)
  })

  test('notes are returned as json', async () => {
    await api
      .get('/api/notes')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all notes are returned', async () => {
    const response = await api.get('/api/notes')

    assert.strictEqual(response.body.length, helper.initialNotes.length)
  })

  test('a specific note is within the returned notes', async () => {
    const response = await api.get('/api/notes')

    const contents = response.body.map((r) => r.content)
    assert(contents.includes('Browser can execute only JavaScript'))
  })

  describe('viewing a specific note', () => {
    test('succeeds with a valid id', async () => {
      const notesAtStart = await helper.notesInDb()

      const noteToView = notesAtStart[0]

      const resultNote = await api
        .get(`/api/notes/${noteToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      assert.deepStrictEqual(resultNote.body, noteToView)
    })

    test('fails with statuscode 404 if note does not exist', async () => {
      const validNonexistingId = await helper.nonExistingId()

      await api.get(`/api/notes/${validNonexistingId}`).expect(404)
    })

    test('fails with statuscode 400 id is invalid', async () => {
      const invalidId = '5a3d5da59070081a82a3445'

      await api.get(`/api/notes/${invalidId}`).expect(400)
    })
  })

  describe('addition of a new note', () => {
    test('succeeds with valid data', async () => {
      const newNote = {
        content: 'async/await simplifies making async calls',
        important: true,
      }

      await api
        .post('/api/notes')
        .send(newNote)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const notesAtEnd = await helper.notesInDb()
      assert.strictEqual(notesAtEnd.length, helper.initialNotes.length + 1)

      const contents = notesAtEnd.map((n) => n.content)
      assert(contents.includes('async/await simplifies making async calls'))
    })

    test('fails with status code 400 if data invalid', async () => {
      const newNote = {
        important: true,
      }

      await api.post('/api/notes').send(newNote).expect(400)

      const notesAtEnd = await helper.notesInDb()

      assert.strictEqual(notesAtEnd.length, helper.initialNotes.length)
    })
  })

  describe('deletion of a note', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const notesAtStart = await helper.notesInDb()
      const noteToDelete = notesAtStart[0]

      await api.delete(`/api/notes/${noteToDelete.id}`).expect(204)

      const notesAtEnd = await helper.notesInDb()

      assert.strictEqual(notesAtEnd.length, helper.initialNotes.length - 1)

      const contents = notesAtEnd.map((r) => r.content)
      assert(!contents.includes(noteToDelete.content))
    })

    test('fails with status code 400 if id is invalid', async () => {
      const invalidID = '5a3d5da59070081a82a3445'
      await api.delete(`/api/notes/${invalidID}`).expect(400)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})

/*
beforeEach(async () => {
  await Note.deleteMany({})
  const noteObjects = helper.initialNotes.map((note) => new Note(note))
  const promiseArray = noteObjects.map((note) => note.save())
  await Promise.all(promiseArray)
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
  test('POST...a valid note', async () => {
    const validNote = {
      content: 'async/await simplifies making async calls',
      important: true,
    }

    await api
      .post('/api/notes')
      .send(validNote)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const notesAtEnd = await helper.notesInDb()
    const contents = notesAtEnd.map((r) => r.content)

    assert.equal(notesAtEnd.length, helper.initialNotes.length + 1)
    assert(contents.includes(validNote.content))
  })

  test('POST...an invalid note without content', async () => {
    const invalidNote = { important: false }

    api.post('/api/notes').send(invalidNote).expect(400)

    const notesAtEnd = await helper.notesInDb()
    assert.ok(notesAtEnd.length, helper.initialNotes.length)
  })

  test('GET...a valid note', async () => {
    const notes = await helper.notesInDb()
    const note = notes.at(0)
    const res = await api
      .get(`/api/notes/${note.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert(res.body.id === note.id)
    assert.deepStrictEqual(res.body, note)
  })

  test('GET...fails with statuscode 404 if note has valid (bson) but non-existing ID', async () => {
    const id = await helper.nonExistingId()
    await api.get(`/api/notes/${id}`).expect(404)
  })

  test('GET...fails with status code 404 if note has an invalid, non-existing ID', async () => {
    const id = '123'
    await api.get(`/api/notes/${id}`).expect(400)
  })

  test('DELETE...a valid note', async () => {
    const notesStart = await helper.notesInDb()
    const note = notesStart.at(0)
    const ID = note.id

    await api.delete(`/api/notes/${ID}`).expect(204)

    const notesEnd = await helper.notesInDb()
    const contents = notesEnd.map((r) => r.content)
    assert(!contents.includes(note.content))
    assert.ok(notesEnd.length, helper.initialNotes.length - 1)
  })

  test('DELETE...an invalid note', async () => {
    const fakeID = await helper.nonExistingId()
    const notesStart = await helper.notesInDb()
    await api.delete(`/api/notes/${fakeID}`).expect(404)
    const notesEnd = await helper.notesInDb()
    assert.ok(notesStart.length, notesEnd.length)
  })
})

after(async () => {
  await mongoose.connection.close()
})
*/
