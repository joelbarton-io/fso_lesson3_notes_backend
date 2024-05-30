const bcrypt = require('bcrypt')
const User = require('../models/user')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const { describe, test, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const api = supertest(app)
const { usersInDb } = require('./helper')
const print = require('../utils/logger')

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })
    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const beforeAdd = await usersInDb()
    const newUser = new User({
      username: 'LEROYYY JENKINS',
      name: 'Leroy',
      // eslint-disable-next-line @stylistic/js/quotes
      password: "comms up, ok let's do this!",
    })
    print.error(newUser)
    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const afterAdd = await usersInDb()
    assert.strictEqual(afterAdd.length, 1 + beforeAdd.length)
    const userNames = afterAdd.map(({ username }) => username)
    assert(userNames.includes(newUser.username))
  })

  test('creation fails with a existing username', async () => {
    const listBefore = await usersInDb()
    const duplicateUser = new User({
      username: 'LEROYYY JENKINS',
      name: 'Leroy',
      password: 'supersecret',
    })

    const response = await api
      .post('/api/users')
      .send(duplicateUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const listAfter = await usersInDb()
    assert(response.body.error.includes('expected `username` to be unique!'))
    assert.strictEqual(listBefore.length, listAfter.length)
  })
})

after(async () => {
  print.info('disconnecting...')
  await User.deleteMany({})
  await mongoose.connection.close()
})
