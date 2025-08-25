require("dotenv").config();
const Person = require("./models/person");

const express = require("express");
var morgan = require("morgan");
const cors = require("cors");
const person = require("./models/person");
const app = express();

app.use(express.json());
app.use(express.static("dist"));
app.use(cors());

morgan.token("body", (req, res) => {
  return JSON.stringify(req.body);
});

app.use(
  morgan(
    ":method :url :status :req[content-length] - :response-time ms :body",
    { stream: process.stdout }
  )
);

app.get("/api/persons", (request, response) => {
  Person.find({}).then((person) => {
    response.json(person);
  });
});

app.get("/info", (request, response, next) => {
  const date = new Date();
  Person.estimatedDocumentCount({}).then(person => {
    response.send(`
      <p>Phonebook has info for ${person} people</p>
      <p>${date}</p>
      `);
  }).catch(error => next (error))
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
  .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
});

app.post("/api/persons", async (request, response) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({
      error: "name missing",
    });
  }
  const existingPerson = await Person.findOne({ name: body.name });

  if (existingPerson) {
    return response.status(400).json({
      error: "name must be unique",
    });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  const savedPerson = await person.save();
  response.json(savedPerson);
});

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body
  // const existingPerson = Person.findOne({ name: name });

  Person.findById(request.params.id)
    .then(person => {
      if (!person) {
        return response.status(404).end()
      }

      person.name = name
      person.number = number

      return person.save().then((updatedPerson) => {
        response.json(updatedPerson)
      })
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app