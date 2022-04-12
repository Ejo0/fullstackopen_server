require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const Person = require('./models/person')

const logger = morgan((tokens, req, res) => {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        JSON.stringify(req.body)
    ].join(' ')
})

app.use(express.static('build'))
app.use(express.json())
app.use(logger)
app.use(cors())

app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id).then(person => {
        if (!(person)) {
            return res.status(404).end()
        }
        res.json(person)
    })
    .catch(error => {next(error)})
})

app.get('/info', (req, res) => {
    Person.find({}).then(p => {
        res.send(
            `<div>
                <p>Phonebook has info for ${p.length} people</p>
                <p>${new Date()}</p>
            </div>`
        )
    })
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
        .then(result => {
            res.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (req, res) => {
    const body = req.body

    if (!(body.name) || !(body.number)) {
        return res.status(404).json({error: 'name or number missing'})
    }

    Person.find({name: body.name}).then(namesakes => {
        if (namesakes.length > 0) {
            return res.status(404).json({error: 'name must be unique'})
        }
        const newPerson = new Person({
            name: body.name,
            number: body.number
        })
    
        newPerson.save().then(savedPerson => {
            res.json(savedPerson)
        })
    })
})

app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(req.params.id, person, {new: true})
        .then(updatedPerson => {
            res.json(updatedPerson)
        })
        .catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
    res.status(404).send({error: 'unknown endpoint'})
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.log(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id'})
    }
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
