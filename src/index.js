const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json({ error: 'User not found' });
  }

  request.todos = user.todos;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: 'User already exists' });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, ({ todos }, response) => {
  return response.json(todos);
});

app.post('/todos', checksExistsUserAccount, ({ todos, body }, response) => {
  const { title, deadline } = body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, ({ todos, body, params }, response) => {
  const { title, deadline } = body;
  const { id } = params;

  const todoIndex = todos.findIndex(todo => todo.id === id);

  if (todoIndex < 0) {
    return response.status(404).json({ error: 'Todo not found' });
  }

  todos[todoIndex] = {
    ...todos[todoIndex],
    title: title || todos[todoIndex].title,
    deadline: deadline || todos[todoIndex].deadline
  };

  return response.json(todos[todoIndex]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, ({ todos, params }, response) => {
  const { id } = params;

  const todoIndex = todos.findIndex(todo => todo.id === id);

  if (todoIndex < 0) {
    return response.status(404).json({ error: 'Todo not found' });
  }

  todos[todoIndex] = { ...todos[todoIndex], done: !todos[todoIndex].done };

  return response.json(todos[todoIndex]);
});

app.delete('/todos/:id', checksExistsUserAccount, ({ todos, params }, response) => {
  const { id } = params;

  const todoIndex = todos.findIndex(todo => todo.id === id);

  if (todoIndex < 0) {
    return response.status(404).json({ error: 'Todo not found' });
  }

  todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = app;