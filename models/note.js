const mongoose = require('mongoose')
/* mongoose setup:
    access mongoose module
    get password from cli input
    configure mongoose options
    connect to the cluster via the url
    create document? schema
    - modify schema with set() to change how data is rendered with `toJSON`
    create a model constructor based on schema
    use constructor to create db data
*/
const noteSchema = mongoose.Schema({
  content: {
    type: String,
    minLength: 5,
    required: true,
  },
  important: Boolean,
})

noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Note', noteSchema)
