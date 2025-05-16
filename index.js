const express = require('express');
const Person = require('./models/person')
const morgan = require('morgan');
const app = express();

app.use(express.static('dist'))
app.use(express.json())

morgan.token('body', req => JSON.stringify(req.body));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

app.get('/', (_request, response) => {
  response.send('<h1>Hello Phonebook!</h1>')
})

app.get('/info', (_request, response, next) => {
  const time = new Date();

  Person.countDocuments({})
    .then(count => {
      const information = `<p>Phonebook has info for ${count} people</p>
                           <p>${time}</p>`;
      response.send(information);
    })
    .catch(error => next(error));
});


app.get('/api/persons', (_request, response,next) => {
    Person.find({})
    .then(persons => {
        response.json(persons);
    })
    .catch(error => next(error));
});

app.get('/api/persons/:id', (request, response,next) => {
       Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person);
            } else {
                response.status(404).end();
            }
        })
        .catch(error => next(error));
});

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body;

  Person.findById(request.params.id)
    .then(person => {
      if (!person) {
        return response.status(404).end();
      }

      person.name = name;
      person.number = number;

      return person.save()
        .then(updatedPerson => {
          response.json(updatedPerson);
        });
    })
    .catch(error => next(error));
});

app.delete('/api/persons/:id', (request, response,next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
        if (result) {
            response.status(204).end()
        } else {
            response.status(404).send({ error: 'person not found' })
        }
        })
        .catch(error => next(error));
    });

app.post('/api/persons', (request, response, next) => {
  const { name, number } = request.body;

  if (!name || !number) {
    return response.status(400).json({ error: 'name or number missing' });
  }

  Person.findOne({ name })
    .then(existing => {
      if (existing) {
        return response.status(400).json({ error: 'name must be unique' });
      }

      const newPerson = new Person({ name, number });
      return newPerson.save(); 
    })
    .then(savedPerson => {
      if (savedPerson) {
        response.json(savedPerson);
      }
    })
    .catch(error => next(error));
});



const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}



const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error) 
}
app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});