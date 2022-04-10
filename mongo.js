const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]

const url =
`mongodb+srv://ejo:${password}@cluster0.hxgar.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
    console.log('phonebook:')
    Person
        .find({})
        .then(persons => {
            persons.forEach(p => console.log(`${p.name} ${p.number}`))
            mongoose.connection.close()
        })
}

if (process.argv.length === 5) {
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4]
    })
    person.save().then(p => {
        console.log(`added ${p.name} number ${p.number} to phonebook`)
        mongoose.connection.close()
    })
}
