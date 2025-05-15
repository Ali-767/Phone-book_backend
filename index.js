const express = require('express');
const morgan = require('morgan');
const app = express();

let persons =[
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
];

app.use(express.static('build'));
morgan.token('body', req => JSON.stringify(req.body));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

app.get('/', (_request, response) => {
  response.send('<h1>Hello Phonebook!</h1>')
})

app.get('/info', (_request, response) => {
    const time = new Date();
    const information = `<p>Phonebook has info for ${persons.length} people</p>
                  <p>${time}</p>`;
                  
    response.send(information);

});

app.get('/api/persons', (_request, response) => {
    response.json(persons)
});

app.get('/api/persons/:id', (request, response) => {
    console.log('get requesr receieved')
    const id= request.params.id;
    const person = persons.find(person => person.id === id);
    if(person){
       return response.json(person);
    }else{
        response.status(404).end();        
    }
});

app.delete('/api/persons/:id', (request,response) => {
    const id = request.params.id;
    persons = persons.filter(person => person.id !==id );
    response.status(204).end();

});

app.use(express.json())
app.post('/api/persons', (request, response) => {
    const person = request.body;
    if(!person.name || !person.number){
        return response.status(400).json({
            error: 'name or number missing'
        });
    }
    if(persons.find(pers => pers.name === person.name)){
        return response.status(400).json({
            error: 'name must be unique'
        });
    }
    const newPerson = {
        id: (Math.random() * 5000).toString(),
        name: person.name,
        number: person.number
    };
    persons = persons.concat(newPerson);
    response.json(newPerson);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});