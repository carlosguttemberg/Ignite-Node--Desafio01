const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userFound = users.find(user => user.username === username);

  if(!userFound){
      return response.status(404).json({error: "User not found"});
  }

  request.user = userFound;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if(userAlreadyExists){
      return response.status(400).json({error: "User already exists!"})
  }

  const id = uuidv4();

  users.push({
      id, 
      username, 
      name,
      todos: []
  });

  const userFound = users.find(user => user.id === id);

  return response.status(201).json(userFound);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const id = uuidv4();

  const todoOperation = {
      id,
      title,
      done: false,
      deadline,
      created_at: new Date(),
  };

  user.todos.push(todoOperation);

  return response.status(201).send(todoOperation);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;

  const { user } = request;

  const todoFound = user.todos.find(todo => todo.id === id);

  if(!todoFound){
    return response.status(404).json({error: "Todo not found"});
  }

  todoFound.title = title;
  todoFound.deadline = deadline;
  return response.status(201).send(todoFound);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoAlter = user.todos.find(todo => todo.id === id);
  if(!todoAlter){
    return response.status(404).json({error: "Todo not found"});
  }

  todoAlter.done = true;

  return response.status(201).send(todoAlter);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const { user } = request;

  const todoDelete = user.todos.find(todo => todo.id === id);

  if(!todoDelete){
    return response.status(404).json({error: "Todo not found"});
  }

  const index = user.todos.indexOf(todoDelete);

  user.todos.splice(index, 1);

  return response.status(204).json(user.todos);
});

module.exports = app;