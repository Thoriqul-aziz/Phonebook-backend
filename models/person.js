const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose
  .connect(url)

  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })
const validator = (v) => {
  return /\d{3}||d{2}-\d{5}/.test(v)
}
const phoneSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    minLength: [9, 'Must be at least 8, got {VALUE}'],
    validate: [
      validator,
      (props) => `${props.value} is not a valid phone number!`,
    ],
    required: [true, 'User phone number required'],
  },
})

phoneSchema.set('toJSON', {
  transform: (returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Person', phoneSchema)
