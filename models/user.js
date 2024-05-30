const mongoose = require('mongoose')
const options = {
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: String,
  passwordHash: String,
  notes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }],
}

const toJSONOptions = {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
  },
}
const UserSchema = new mongoose.Schema(options)
UserSchema.set('toJSON', toJSONOptions)

module.exports = mongoose.model('User', UserSchema)
