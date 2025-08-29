const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://azizthoriqul:${password}@cluster0.ynnvmdd.mongodb.net/Phonebook?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const phoneSchema = new mongoose.Schema({
  name: String,
  number: String,
  date: { type: Date, default: Date.now },
})

const Person = mongoose.model('Person', phoneSchema)

// const person = new Person({
//   name: process.argv[3],
//   number: process.argv[4]
// })

// person.save().then(result => {
//   console.log(`added ${person.name} number ${person.number} to phonebook`)
//   mongoose.connection.close()
// })

if (process.argv.length < 4) {
  Person.find({}).then((result) => {
    console.log('phonebook:')
    result.map((person) => {
      console.log(person.name, person.number)
    })
    mongoose.connection.close()
  })
}
