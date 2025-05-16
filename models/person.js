const mongoose = require('mongoose')

mongoose.set('strictQuery', false)


const url = process.env.MONGODB_URI
const phoneRegex = /^\d{2,3}-\d+$/;


console.log('connecting to', url)
mongoose.connect(url)

  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      minlength: 3,
    },
    number:  {
    type: String,
    minlength: [8, 'Phone number must be at least 8 characters long'],
    validate: {
      validator: (val) => {
        return phoneRegex.test(val);
      },
      message: props => `${props.value} is not a valid phone number! Format must be XX-XXXXXXX or XXX-XXXXXXXX`
    },
    required: [true, 'Phone number is required']
  }
})
personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})


module.exports = mongoose.model('Person', personSchema)